<?php
/*
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */
namespace Tutteli\AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;

class BillController extends AEntityController {
    protected function getCsrfTokenDomain() {
        return 'bill';
    }
    
    protected function getSingularEntityName() {
        return 'bill';
    }
    
    protected function getPluralEntityName() {
        return 'bills';
    }
    
    protected function getRepository() {
        return $this->getDoctrine()->getRepository('TutteliAppBundle:Bill');
    }
    
    protected function getJson($bill) {
        /*@var $bill \Tutteli\AppBundle\Entity\Bill */
        return  '{'
                .'"id": "'.$bill->getId().'"'
                .',"month": "'.$this->getFormattedDate($bill->getMonth()).'"'
                 .'"debtor":"'
                    .'{'
                    .'"id":"'.$bill->getUserDebtor()->getId().'"'
                    .',"username": "'.$bill->getUserDebtor()->getUsername().'"'
                    .'}'
                .'"creditor":"'
                    .'{'
                    .'"id":"'.$bill->getUserCreditor()->getId().'"'
                    .',"username": "'.$bill->getUserCreditor()->getUsername().'"'
                    .'}'
                .'"amount":"'.$bill->getAmount().'"'
                .'"isPayed":"'.$bill->isPayed() ? '1':'0'.'"'
                .$this->getMetaJsonRows($bill)
                .'}';
    }
    
    public function currentYearAction() {
        return new RedirectResponse($this->container->get('router')->generate(
                'bills_year',
                ['year' => date('Y')],
                UrlGeneratorInterface::ABSOLUTE_URL));
    }
    
    public function yearTplAction(Request $request) {
        return $this->getHtmlForEntities($request, '.tpl', 'bill', null);
    }
    
    public function yearJsonAction(Request $request, $year) {
        /*@var $repository \Tutteli\AppBundle\Entity\BillRepository */
        $repository = $this->getRepository();
        return $this->getJsonForEntities($request,
                function() use($repository, $year) {
                    return $repository->getLastUpdatedForYear($year);
                },
                function() use($repository, $year) {
                    return $repository->getForYear($year);
                });
    }
    
    public function yearAction(Request $request, $year, $ending) {
        return $this->getHtmlForEntities($request, $ending, 'bill', function() use($year) {
            $repository = $this->getRepository();
            return $repository->getForYear($year);
        }, ['year' => $year]);
    }
    

    public function getJsonAction($billId) {
        return $this->getJsonForEntityAction($billId);
    }
    
    public function editAction(Request $request, $billId, $ending) {
        return $this->editEntityAction($request, $billId, $ending);
    }
    
    public function postAction(Request $request) {
        return $this->postEntity($request);
    }
}