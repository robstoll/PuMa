<?php

/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
namespace Tutteli\AppBundle\Controller;

use FOS\RestBundle\Controller\FOSRestController;
use FOS\RestBundle\Controller\Annotations\RouteResource;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Tutteli\AppBundle\Entity\Purchase;
use Tutteli\AppBundle\Entity\User;
use Tutteli\AppBundle\Entity\PurchasePosition;

/**
 * @RouteResource("Purchase")
 */
class PurchaseRestController extends FOSRestController {
    
    // "get_purchases" [GET] /purchases
    public function cgetAction() {
        return new Response("tata");
    }
    
    // "new_purchases" [GET] /purchases/new
    public function newAction(Request $request) {
        $ending = '';
        if ($ending != '' && $ending != '.tpl') {
            throw $this->createNotFoundException('File Not Found');
        }
        
        if ($ending == '.tpl') {
            $response = new Response();
            $path = $this->get('kernel')->locateResource('@TutteliAppBundle/Resources/views/Purchase/index.html.twig');
            $etag = hash_file('md5', $path);
            $response->setETag($etag);
            if ($response->isNotModified($request)) {
                return $response;
            }
        }
        
        $response = $this->render('TutteliAppBundle:Purchase:index.html.twig', 
                array (
                        'notXhr' => $ending == '',
                        'error' => null 
                ));
        
        if ($ending == '.tpl') {
            $response->setETag($etag);
        }
        return $response;
    }
    
    // "get_user" [GET] /purchases/{slug}
    public function getAction($slug) {
        return new Response($slug);
    }
    
    // "post_purchases" [POST] /purchases
    public function postAction(Request $request) {
        if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
            return $this->savePurchase($request);
        }
        return new Response('{"msg": "Wrong Content-Type"}', Response::HTTP_BAD_REQUEST);
    }
    
    private function savePurchase(Request $request) {
        $data = json_decode($request->getContent(), true);
        if ($data != null) {
            $purchase = new Purchase();
            $errors = $this->mapPurchase($purchase, $data);
            $validator = $this->get('validator');
            $errorsPurchase = $validator->validate($purchase);
            $errors->addAll($errorsPurchase);
            if (count($errors) > 0) {
                return new JsonResponse($this->getErrorArray($errors), Response::HTTP_BAD_REQUEST);
            } else {
                $em = $this->getDoctrine()->getManager();
                $em->persist($purchase);
                foreach($purchase->getPositions() as $position) {
                    $em->persist($position);
                }
                $em->flush();
                return new Response('{"id": "'.$purchase->getId().'"}', Response::HTTP_CREATED);
            }
        }
        return new Response('{"msg": "no data provided"}', Response::HTTP_BAD_REQUEST);
    }
    
    private function getErrorArray($errorList){
        $errors = array();
        foreach ($errorList as $error) {
            $errors[$error->getPropertyPath()] = $this->get('translator')->trans($error->getMessage(), [], 'validators');
        }
        return $errors;
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
