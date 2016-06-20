<?php
/*
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */
namespace Tutteli\AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Component\Security\Csrf\CsrfToken;

class CsrfService {
    
    private $tokenManager;
    
    public function __construct(CsrfTokenManagerInterface $tokenManager) {
        $this->tokenManager = $tokenManager;
    }
    
    public function getCsrfToken($csrfTokenDomain) {
        return new Response('{"csrf_token": "'.$this->tokenManager->getToken($csrfTokenDomain).'"}');
    }
    
    public function decodeDataAndVerifyCsrf(Request $request, $csrfTokenDomain) {
        $response = null;
        $data = json_decode($request->getContent(), true);
        if ($data != null) {
            if (!array_key_exists('csrf_token', $data)
                    || !$this->isCsrfTokenValid($csrfTokenDomain, $data['csrf_token'])) {
                $response = new JsonResponse('Invalid CSRF token.', Response::HTTP_UNAUTHORIZED);
            }
        } else {
            $response = new JsonResponse('No data provided.', Response::HTTP_BAD_REQUEST);
        }
        return [$data, $response];
    }
    
    private function isCsrfTokenValid($csrfTokenDomain, $csrfToken) {
        return $this->tokenManager->isTokenValid(new CsrfToken($csrfTokenDomain, $csrfToken));
    }
  
}