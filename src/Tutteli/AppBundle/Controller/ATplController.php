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

abstract class ATplController extends Controller {
    
    protected function checkEnding(Request $request, $ending) {
        if ($ending != '' && $ending != '.tpl') {
            throw $this->createNotFoundException('File Not Found');
        } else if ($ending == '.tpl' && ! $request->isXmlHttpRequest() 
                && $this->container->get('kernel')->getEnvironment() != 'dev') {
            return new Response('partials are only available per xmlHttpRequest', Response::HTTP_BAD_REQUEST);
        }
    }

}