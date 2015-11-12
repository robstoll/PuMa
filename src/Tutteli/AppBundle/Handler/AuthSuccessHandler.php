<?php

/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
namespace Tutteli\AppBundle\Handler;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Http\Authentication\DefaultAuthenticationSuccessHandler;
use Symfony\Component\Security\Http\HttpUtils;

class AuthSuccessHandler extends DefaultAuthenticationSuccessHandler {
    const PAGE_BEFORE_LOGIN = '_security.secured_area.target_path';
    public function __construct(HttpUtils $httpUtils, array $options) {
        parent::__construct($httpUtils, $options);
    }
    
    public function onAuthenticationSuccess(Request $request, TokenInterface $token) {
        if ($request->isXmlHttpRequest()) {
            $user = $token->getUser();
            $redirectUrl = $request->getSession()->get('_security.main.target_path');
            return new Response(
                    '{'
                       .'"user": {'
                       .'"id":"'.$user->getId().'",'
                       .'"role":"'.$user->getRole().'",'
                       .'"username":"'.$user->getUserName().'"'
                       .'},' 
                       .'"url":"'.$redirectUrl.'"'
                    .'}');
        }
        return parent::onAuthenticationSuccess($request, $token);
    }
}
