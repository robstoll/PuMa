<?php
/*
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */
namespace Tutteli\AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Tutteli\AppBundle\Entity\Purchase;
use Tutteli\AppBundle\Entity\PurchasePosition;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\HttpFoundation\Response;

class PurchaseController extends AEntityController {
    
    protected function getCsrfTokenDomain() {
        return 'purchase';
    }
    
    protected function getEntityNameSingular() {
        return 'purchase';
    }
    
    protected function getEntityNamePlural() {
        return 'purchases';
    }
    
    protected function getRepository() {
        return $this->getDoctrine()->getRepository('TutteliAppBundle:Purchase');
    }
    
    protected function getJson($purchase) {
        /*@var $purchase \Tutteli\AppBundle\Entity\Purchase */
        return  '{'
                .'"id": "'.$purchase->getId().'"'
                .',"purchaseDate": "'.$this->getFormattedDate($purchase->getPurchaseDate()).'"'
                .',"total": "'.$purchase->getTotal().'"'
                .',"user":'
                    .'{'
                    .'"id":"'.$purchase->getUser()->getId().'"'
                    .',"username": "'.$purchase->getUser()->getUsername().'"'
                    .'}'
                .',"positions":'.$this->getJsonArray($purchase->getPositions(), function($position) { return $this->getJsonForPosition($position); })
                .$this->getMetaJsonRows($purchase)
                .'}';
    }
    
    private function getJsonForPosition(PurchasePosition $position) {
        return '{'
                .'"id":"'.$position->getId().'"'
                .',"expression":"'.$position->getExpression().'"'
                .',"price":"'.$position->getPrice().'"'
                .',"category":'
                    .'{'
                    .'"id":"'.$position->getCategory()->getId().'"'
                    .',"name":"'.$position->getCategory()->getName().'"'
                    .'}'                                
                .',"notice":"'.$position->getNotice().'"'
                .$this->getMetaJsonRows($position)
                .'}';
    }
    
    public function currentMonthAction() {
        return new RedirectResponse($this->container->get('router')->generate(
                'purchases_monthAndYear', 
                ['month' => date('m'), 'year' => date('Y')],
                UrlGeneratorInterface::ABSOLUTE_URL));
    }
    
    public function monthTplAction(Request $request) {
        return $this->getHtmlForEntities($request, '.tpl', 'month', null);
    }
    
    public function monthAndYearJsonAction(Request $request, $month, $year) {
        /*@var $repository \Tutteli\AppBundle\Entity\PurchaseRepository */
        $repository = $this->getRepository();
        return $this->getJsonForEntities($request, 
                function() use($repository, $month, $year) {
                    return $repository->getLastUpdatedForMonthOfYear($month, $year);
                }, 
                function() use($repository, $month, $year) {
                    return $repository->getForMonthOfYear($month, $year);
                });
    }
    
    public function monthAndYearAction(Request $request, $month, $year, $ending) {
        return $this->getHtmlForEntities($request, $ending, 'month', function() use($month, $year) {
            $repository = $this->getRepository();
            return $repository->getForMonthOfYear($month, $year);
        }, ['month' => $month, 'year' => $year]);
    }
    
    public function getJsonAction($purchaseId) {
        return $this->getJsonForEntityAction($purchaseId);
    }
    
    public function editAction(Request $request, $purchaseId, $ending) {
        return $this->editEntityAction($request, $purchaseId, $ending);
    }
    
    public function postAction(Request $request) {
        return $this->postEntity($request);
    }
    
    protected function createPurchase(Request $request) {
        list($data, $response) = $this->decodeDataAndVerifyCsrf($request);
        if (!$response) {
            $purchase = new Purchase();
            $errors = $this->mapPurchase($purchase, $data, function() use($purchase) {
               return $this->createPurchasePosition($purchase);
            });
            $validator = $this->get('validator');
            $errorsPurchase = $validator->validate($purchase);
            $errorsPurchase = $this->translateErrors($errorsPurchase, null);
            $errors->addAll($errorsPurchase);
            if (count($errors) > 0) {
                $response = $this->getValidationResponse($errors);
            } else {
                $em = $this->getDoctrine()->getManager();
                $em->persist($purchase);
                foreach($purchase->getPositions() as $position) {
                    $em->persist($position);
                }
                $em->flush();
                $response = $this->getCreateResponse($purchase->getId());
            }
        }
        return $response;
    }
    
    private function createPurchasePosition(Purchase $purchase){
        $position = new PurchasePosition();
        $position->setPurchase($purchase);
        $purchase->addPosition($position);
        return $position;
    }
    
    private function mapPurchase($purchase, $data, callable $createOrGet) {
        $em = $this->getDoctrine()->getManager();
        $purchase->setUser($em->getReference('TutteliAppBundle:User', $data['userId']));
        $purchase->setPurchaseDate(new \DateTime($data['dt']));
    
        $validator = $this->get('validator');
        $errors = new ConstraintViolationList();
        $numPos = count($data['positions']);
        $total = 0;
        for ($i = 0; $i < $numPos; ++$i) {
            $position = $createOrGet($i);
            $this->mapPurchasePosition($position, $data, $i, $validator, $errors);
            
            $total += $position->getPrice();
        }
        $purchase->setTotal($total);
        
        if ($numPos == 0) {
            $translator = $this->get('translator');
            $message = $translator->trans('purchase.positions', [], 'validators');
            $errors->add(new ConstraintViolation($message, $message, [], $purchase, 'positions', null)); 
        }
        return $errors;
    }
   
    private function mapPurchasePosition(PurchasePosition $position, array $data, $index, $validator, $errors) {
        $dataPos = $data['positions'][$index];
        $em = $this->getDoctrine()->getManager();
        $position->setCategory($em->getReference('TutteliAppBundle:Category', $dataPos['categoryId']));
        $position->setExpression($dataPos['expression']);
        $position->setNotice($dataPos['notice']);
        $newErrors = $validator->validate($position);
        if (count($newErrors) == 0) {
            $price = null;
            eval('$price = '.$dataPos['expression'].';');
            $position->setPrice($price);
            if ($price <= 0) {
                $newErrors->add(new ConstraintViolation(
                    'purchase.price', 'purchase.price', [], $position, 'price', $price));      
            }
        }
        if(count($newErrors) > 0) {
            $newErrors = $this->translateErrors($newErrors, $index + 1);
            $errors->addAll($newErrors);
        }
    }
    
    private function translateErrors(ConstraintViolationList $errorList, $posNumber){
        $list = new ConstraintViolationList();
        $translator = $this->get('translator');
        foreach ($errorList as $constraint) {
            $message = $translator->trans($constraint->getMessage(), ["pos" => $posNumber], 'validators');
            $list->add(new ConstraintViolation(
                    $message, 
                    $constraint->getMessageTemplate(), 
                    $constraint->getMessageParameters(),
                    $constraint->getRoot(),
                    $constraint->getPropertyPath(),
                    $constraint->getInvalidValue()));
        }
        return $list;
    }
    
    public function putAction(Request $request, $purchaseId) {
        return $this->putEntity($request, $purchaseId);
    }
 
    protected function updatePurchase(Request $request, Purchase $purchase) {
        list($data, $response) = $this->decodeDataAndVerifyCsrf($request);
        if (!$response) {
            $positionIds = [];
            $errors = $this->mapPurchase($purchase, $data, function($index) use($purchase, $data, &$positionIds) {
                $dataPos = $data['positions'][$index];
                if (array_key_exists('id', $dataPos)) {
                    $positionIds[] = $dataPos['id'];
                    return $purchase->getPositions()->get($dataPos['id']);
                } 
                return $this->createPurchasePosition($purchase);
            });
            $validator = $this->get('validator');
            $errorsPurchase = $validator->validate($purchase);
            $errorsPurchase = $this->translateErrors($errorsPurchase, null);
            $errors->addAll($errorsPurchase);
            if (count($errors) > 0) {
                $response = $this->getValidationResponse($errors);
            } else {
                $this->updatePurchaseAndPositions($purchase, $positionIds);
                $response = new Response('', Response::HTTP_NO_CONTENT);
            }
        }
        return $response;
    }
    
    private function updatePurchaseAndPositions(Purchase $purchase, array $positionIds) {
        $em = $this->getDoctrine()->getManager();
        $em->merge($purchase);
        foreach($purchase->getPositions() as $position) {
            $id = $position->getId();
            if ($id === null) {
                $em->persist($position);
            } else if (array_key_exists($id, $positionIds)) {
                $em->merge($position);
            } else {
                $em->remove($position);
            }
        }
        $em->flush();
    } 
}
