<?php
/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */
namespace Tutteli\AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;

class BillingController extends AEntityController {
    protected function getCsrfTokenDomain() {
        return 'billing';
    }
    
    protected function getSingularEntityName() {
        return 'billing';
    }
    
    protected function getPluralEntityName() {
        return 'billings';
    }
    
    protected function getRepository() {
        return $this->getDoctrine()->getRepository('TutteliAppBundle:Billing');
    }
    
    protected function getJson($billing) {
        /*@var $billing \Tutteli\AppBundle\Entity\Billing */
        return  '{'
                .'"id": "'.$billing->getId().'"'
                .',"month": "'.$this->getFormattedDate($billing->getMonth()).'"'
                 .'"debtor":"'
                    .'{'
                    .'"id":"'.$billing->getUserDebtor()->getId().'"'
                    .',"username": "'.$billing->getUserDebtor()->getUsername().'"'
                    .'}'
                .'"creditor":"'
                    .'{'
                    .'"id":"'.$billing->getUserCreditor()->getId().'"'
                    .',"username": "'.$billing->getUserCreditor()->getUsername().'"'
                    .'}'
                .'"amount":"'.$billing->getAmount().'"'
                .'"isPayed":"'.$billing->isPayed() ? '1':'0'.'"'
                .$this->getMetaJsonRows($billing)
                .'}';
    }
    
    public function currentYearAction() {
        return new RedirectResponse($this->container->get('router')->generate(
                'billing_year',
                ['year' => date('Y')],
                UrlGeneratorInterface::ABSOLUTE_URL));
    }
    
    public function billingTplAction(Request $request) {
        return $this->getHtmlForEntities($request, '.tpl', 'billing', null);
    }
    
    public function yearJsonAction(Request $request, $year) {
        /*@var $repository \Tutteli\AppBundle\Entity\BillingRepository */
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
        return $this->getHtmlForEntities($request, $ending, 'billing', function() use($year) {
            $repository = $this->getRepository();
            return $repository->getForYear($year);
        }, ['year' => $year]);
    }
    

    public function getJsonAction($billingId) {
        return $this->getJsonForEntityAction($billingId);
    }
    
    public function editAction(Request $request, $billingId, $ending) {
        return $this->editEntityAction($request, $billingId, $ending);
    }
    
    public function postAction(Request $request) {
        return $this->postEntity($request);
    }
}