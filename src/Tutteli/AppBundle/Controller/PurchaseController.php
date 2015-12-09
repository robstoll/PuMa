<?php
/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
namespace Tutteli\AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Tutteli\AppBundle\Entity\Purchase;
use Tutteli\AppBundle\Entity\PurchasePosition;
use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\Validator\ConstraintViolation;

class PurchaseController extends ATplController {
    
    public function newAction(Request $request, $ending) {
        list($etag, $response) = $this->checkEnding($request, $ending, function(){
            $path = $this->get('kernel')->locateResource('@TutteliAppBundle/Resources/views/Purchase/index.html.twig');
            $etag = hash_file('md5', $path);
            return $etag;
        });
        
        if (!$response) {
            $response = $this->render('TutteliAppBundle:Purchase:index.html.twig', array (
                    'notXhr' => $ending == '',
                    'error' => null 
            ));
            
            if ($ending == '.tpl') {
                $response->setETag($etag);
            }
        }
        return $response;
    }
    
    public function postAction(Request $request) {
        if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
            return $this->savePurchase($request);
        }
        return new Response('{"msg": "Wrong Content-Type"}', Response::HTTP_BAD_REQUEST);
    }
    
    private function savePurchase(Request $request) {
        list($data, $response) = $this->decodeDataAndVerifyCsrf($request);
        if (!$response) {
            $purchase = new Purchase();
            $errors = $this->mapPurchase($purchase, $data);
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
    
    private function mapPurchase($purchase, $data) {
        $em = $this->getDoctrine()->getManager();
        $purchase->setUser($em->getReference('TutteliAppBundle:User', $data['userId']));
        $purchase->setPurchaseDate(new \DateTime($data['dt']));
    
        $validator = $this->get('validator');
        $errors = new ConstraintViolationList();
        $numPos = count($data['positions']);
        for ($i = 0; $i < $numPos; ++$i) {
            $dataPos = $data['positions'][$i];
            $position = $this->createPosition($dataPos);
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
                $newErrors = $this->translateErrors($newErrors, $i + 1);
                $errors->addAll($newErrors);
            }
            $position->setPurchase($purchase);
            $purchase->addPosition($position);
        }

        if ($numPos == 0) {
            $translator = $this->get('translator');
            $message = $translator->trans('purchase.positions', [], 'validators');
            $errors->add(new ConstraintViolation($message, $message, [], $purchase, 'positions', null)); 
        }
        
        return $errors;
    }
    
    private function createPosition(array $dataPos) {
        $position = new PurchasePosition();
        $em = $this->getDoctrine()->getManager();
        $position->setCategory($em->getReference('TutteliAppBundle:Category', $dataPos['categoryId']));
        $position->setExpression($dataPos['expression']);
        $position->setNotice($dataPos['notice']);
        return $position;
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
    
}
