<?php

/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
namespace Tutteli\AppBundle\Listener;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpKernel\Event\GetResponseForExceptionEvent;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use Symfony\Component\Security\Core\Authentication\Token\AnonymousToken;

class ExceptionListener 
{
    /**
     * @var \Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface
     */
    private $tokenStorage;
    
    public function __construct(TokenStorageInterface $tokenStorage) {
        $this->tokenStorage = $tokenStorage;
    }
    
    public function onKernelException(GetResponseForExceptionEvent $event) {
        if ($event->getRequest()->isXmlHttpRequest()) {
            $exception = $event->getException();
            if ($exception instanceof AccessDeniedException) {
                if ($this->tokenStorage->getToken() instanceof AnonymousToken) {
                    $responseData = array('status' => 401, 'msg' => 'Not Authenticated');
                } else {
                    $responseData = array('status' => 403, 'msg' => 'Forbidden');
                }
                $response = new JsonResponse($responseData, $responseData['status']);
                $event->setResponse($response);
            }
        }
        return false;
    }
}