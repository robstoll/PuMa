<?php
/*
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */
namespace Tutteli\AppBundle\Controller;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class AccountingController extends Controller {
    
    const CSRF_TOKEN_DOMAIN = 'accounting';
    
    public function csrfTokenAction() {
        return $this->get('tutteli.csrf_service')->getCsrfToken(AccountingController::CSRF_TOKEN_DOMAIN);
    }
    
    public function terminateMonthAction(Request $request, $month, $year) {
        if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
            return $this->terminateMonth($request, $month, $year);
        }
        return new Response('{"msg": "Wrong Content-Type"}', Response::HTTP_BAD_REQUEST);
    }
    
    private function terminateMonth(Request $request, $month, $year) {
        list($noData, $response) = $this->get('tutteli.csrf_service')->decodeDataAndVerifyCsrf($request, AccountingController::CSRF_TOKEN_DOMAIN);
        if (!$response) {
            
            // TODO create an Accounting entity. In this case this controller might well be a subclass of AEntityController as well. 
            // Well, maybe not, we do not have post actions tpl etc.
        }
        return $response;
    }
    
}