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

class PurchaseController extends Controller {
    
    public function indexAction(Request $request, $ending = null) {        
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
        
        $response = $this->render('TutteliAppBundle:Purchase:index.html.twig', array(
                'notXhr' => $ending == '',
                'error' => null,
        ));
        
        if ($ending == '.tpl') {
            $response->setETag($etag);
        }
        return $response;
    }
    
    public function newAction(Request $request) {
        return new Response("hello");
    }
    
}
