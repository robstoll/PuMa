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
use Tutteli\AppBundle\Entity\Accounting;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;

class AccountingController extends Controller {
    
    const CSRF_TOKEN_DOMAIN = 'accounting';
    
    public function csrfTokenAction() {
        return $this->get('tutteli.csrf_service')->getCsrfToken(AccountingController::CSRF_TOKEN_DOMAIN);
    }
    
    public function cgetJsonAction(Request $request, $year) {
        $repository = $this->getRepository();
        return $this->get('tutteli.json_service')->getJsonForEntities(
                $request, 
                function() use($repository, $year) {
                    return $repository->getLastUpdatedForYear($year);
                },
                function() use($repository, $year) {
                    return $repository->getForYear($year);
                },
                function($entity) { return $this->getJson($entity);},
                'accountings'
        );
    }
    
    private function getJson(Accounting $entity) {
        /* @var $jsonService \Tutteli\AppBundle\Controller\JsonService */
        $jsonService = $this->get('tutteli.json_service');
        return '{'
                    .'"id":"'.$entity->getId().'"'
                    .',"month":"'.$jsonService->getFormattedDate($entity->getMonth()).'"'
                    .',"reopened":"'.($entity->isReopened() ? '1':'0').'"'
                    .$jsonService->getMetaJsonRows($entity)
                .'}';
    }
    
    /**
     * @return \Tutteli\AppBundle\Entity\AccountingRepository
     */
    private function getRepository() {
        return $this->getDoctrine()->getRepository('TutteliAppBundle:Accounting');
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
            $repository = $this->getRepository();
            /* @var $accountingMonth \Tutteli\AppBundle\Entity\Accounting */
            $months = $repository->getForMonthAndPrevious($month, $year);
            $errors = $this->validate($month, $months);
            if(count($errors) > 0) {
                $response = $this->get('tutteli.error_service')->getTranslatedValidationResponse($errors);
            } else {
                // TODO create the corresponding accounting entity, update reopened respectivel
                // TODO create the bill entities
            }            
        }
        return $response;
    }
    
    private function validate($month, array $months) {
        $errors = new ConstraintViolationList();
        if (count($months) == 0) {
            
            //TODO check if this is the first month which is terminated => there does not exist a purchase which is done in an earlier month
            $errors->add(new ConstraintViolation(
                    'accounting.previousMonthNotTerminated', 'accounting.previousMonthNotTerminated', ['%prev' => $month-1, '%current' => $month], $month, 'month', null));
        } else if (count($months) == 2 && !$months[0]->isReopened()) {
            $errors->add(new ConstraintViolation(
                    'accounting.givenMonthAlreadyTerminated', 'accounting.givenMonthAlreadyTerminated', ['%month' => $month], $month, 'month', null));
        }
        return $errors;
    }
    
}