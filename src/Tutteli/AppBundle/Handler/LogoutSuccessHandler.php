<?php

/*
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */
namespace Tutteli\AppBundle\Handler;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\HttpUtils;
use Symfony\Component\Security\Http\Logout\DefaultLogoutSuccessHandler;

class LogoutSuccessHandler extends DefaultLogoutSuccessHandler 
{    
    private $rememberMeCookieName;
    private $rememberMeCookiePath;
    
    public function __construct(HttpUtils $httpUtils, $rememberMeCookieName, $rememberMeCookiePath) {
        parent::__construct($httpUtils);
        $this->rememberMeCookieName = $rememberMeCookieName;
        $this->rememberMeCookiePath = $rememberMeCookiePath;
    }
    
    public function onLogoutSuccess(Request $request) {
        if ($request->isXmlHttpRequest()) {
            $response = new Response('', Response::HTTP_NO_CONTENT);
        } else {
            $response = parent::onLogoutSuccess($request);
        }
        $response->headers->clearCookie($this->rememberMeCookieName, $this->rememberMeCookiePath, $_SERVER['HTTP_HOST']);
        return $response;
    }
}
