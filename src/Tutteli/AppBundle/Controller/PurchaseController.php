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
    
        $errors = null;
        foreach ($data['positions'] as $dataPos) {
            $position = new PurchasePosition();
            $position->setCategory($em->getReference('TutteliAppBundle:Category', $dataPos['categoryId']));
            $position->setPrice($dataPos['price']);
            $position->setNotice($dataPos['notice']);
            $validator = $this->get('validator');
            $newErrors = $validator->validate($position);
            if ($errors) {
                $errors->addAll($newErrors);
            } else {
                $errors = $newErrors;
            }
            $position->setPurchase($purchase);
            $purchase->addPosition($position);
        }
        return $errors;
    }
    
}
