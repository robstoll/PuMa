<?php
/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
namespace Tutteli\AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityController extends ATplController {
    
    public function loginAction(Request $request, $ending = null) {        
        list($etag, $response) = $this->checkEnding($request, $ending, function(){
            $csrf = $this->get('form.csrf_provider');
            $etag = $csrf->generateCsrfToken('authenticate').'0.0.1';
            return $etag;
        });
        
        $authenticationUtils = $this->get('security.authentication_utils');
        $response = $this->render('TutteliAppBundle:Security:login.html.twig', array(
                'notXhr' => $ending == '',
                'error' => $authenticationUtils->getLastAuthenticationError(),
        ));
        
        if ($ending == '.tpl') {
            $response->setETag($etag);
        }
        return $response;
    }
    
    public function csrfTokenAction() {
        $csrf = $this->get('form.csrf_provider');
        return new Response('{"csrf_token": "'.$csrf->generateCsrfToken('authenticate').'"}');
    }
    
    public function loginCheckAction() {
        // this controller will not be executed,
        // as the route is handled by the Security system
    }
}
