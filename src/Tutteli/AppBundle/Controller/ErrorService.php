<?php
/*
 * This file is part of the project tutteli/puma published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/PuMa
 */
namespace Tutteli\AppBundle\Controller;

use Symfony\Component\Validator\ConstraintViolationList;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Translation\TranslatorInterface;
use Symfony\Component\HttpFoundation\Response;

class ErrorService {
    
    /**
     * @var \Symfony\Component\Translation\TranslatorInterface
     */
    private $translator;
    
    public function __construct(TranslatorInterface $translator) {
        $this->translator = $translator;
    }
    
    public function getTranslatedValidationResponse(ConstraintViolationList $errorList) {
        return $this->getResponse(
            $errorList, 
            function($error) { 
                return $this->translator->trans($error->getMessage(), $error->getParameters(), 'validators'); 
            }
        );
    }
    
    private function getResponse(ConstraintViolationList $errorList, callable $getMessage) {
        $errors = array();
        foreach ($errorList as $error) {
            $errors[$error->getPropertyPath()] = $getMessage($error);
        }
        return new JsonResponse($errors, Response::HTTP_BAD_REQUEST);
    }
    
    public function getValidationResponse(ConstraintViolationList $errorList) {
        return $this->getResponse($errorList, function($error) { return $error->getMessage(); });
    }
}