<?php
/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
namespace Tutteli\AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;

class SecurityController extends ATplController {
    
    protected function getCsrfTokenDomain() {
        return 'authenticate';
    }
    
    public function loginAction(Request $request, $ending = null) {        
        list($etag, $response) = $this->checkEndingAndEtag($request, $ending, function() {
            $csrf = $this->get('security.csrf.token_manager');
            $etag = $csrf->getToken('authenticate').'0.0.1';
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
}
