<?php

/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
namespace Tutteli\AppBundle\Handler;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authentication\DefaultAuthenticationFailureHandler;
use Symfony\Component\Security\Http\HttpUtils;
use Symfony\Component\HttpKernel\HttpKernelInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

class AuthFailureHandler extends DefaultAuthenticationFailureHandler {
    
    public function __construct(HttpKernelInterface $httpKernel, HttpUtils $httpUtils, array $options, 
            LoggerInterface $logger = null) {
        parent::__construct($httpKernel, $httpUtils, $options, $logger);
    }
    
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception) {
        if ($request->isXmlHttpRequest()) {
            return new JsonResponse($exception->getMessage(), Response::HTTP_UNAUTHORIZED);
        }
        return parent::onAuthenticationFailure($request, $exception);
    }
}
