<?php
/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */

namespace Tutteli\AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Validator\ConstraintViolation;
use Tutteli\AppBundle\Entity\ChangePasswordDto;
use Tutteli\AppBundle\Entity\User;

class UserController extends AEntityController {

    protected function getCsrfTokenDomain() {
        return 'user';
    }

    protected function getSingularEntityName() {
        return 'user';
    }
    
    protected function getPluralEntityName() {
        return 'users';
    }
    
    protected function getRepository() {
        return $this->getDoctrine()->getRepository('TutteliAppBundle:User');
    }

    protected function getJson($user) {
        /* @var $user \Tutteli\AppBundle\Entity\User */
        $translator = $this->get('translator');
        return '{'
                .'"id":"'.$user->getId().'"'
                .',"username":"'.$user->getUsername().'"'
                .',"email":"'.$user->getEmail().'"'
                .',"roleId":"'.$user->getRole().'"'
                .',"role":"'.$translator->trans('users.roles.'.$user->getRole()).'"'
                .$this->getMetaJsonRows($user)
                .'}';
    }
    
    public function getJsonAction($userId) {
        return $this->getJsonForEntityAction($userId);
    }
    
    public function cgetAction(Request $request, $ending) {
        $this->denyAccessUnlessGranted('ROLE_ADMIN', null, 'Unable to access this page!');
        return parent::cgetAction($request, $ending);
    }  
    
    public function newAction(Request $request, $ending) {
        $this->denyAccessUnlessGranted('ROLE_ADMIN', null, 'Unable to access this page!');
        
        $viewPath = '@TutteliAppBundle/Resources/views/User/new.html.twig';
        list($etag, $response) = $this->checkEndingAndEtagForView($request, $ending, $viewPath);
    
        if (!$response) {
            $response = $this->render($viewPath, array (
                    'notXhr' => $ending == '',
                    'error' => null,
            ));
    
            if ($ending == '.tpl') {
                $response->setETag($etag);
            }
        }
        return $response;
    }
    
    public function postAction(Request $request) {
        $this->denyAccessUnlessGranted('ROLE_ADMIN', null, 'Unable to access this page!');
        
        if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
            return $this->createUser($request);
        }
        return new Response('{"msg": "Wrong Content-Type"}', Response::HTTP_BAD_REQUEST);
    }
    
    private function createUser(Request $request) {
        list($data, $response) = $this->decodeDataAndVerifyCsrf($request);
        if (!$response) {
            $user = new User();
            $user->setPlainPassword($this->generatePassword());
            $this->encodePassword($user);
            $this->mapUser($user, $data);
            $validator = $this->get('validator');
            $errors = $validator->validate($user);
            if (count($errors) > 0) {
                $response = $this->getTranslatedValidationResponse($errors);
            } else {
                $em = $this->getDoctrine()->getManager();
                $em->persist($user);
                $em->flush();
                try {
                    $this->sendPassword($user);
                    $response = $this->getCreateResponse($user->getId());
                } catch(Exception $e) {
                    $translator = $this->get('translator');
                    $response = new Response(
                            '{'
                            .'"userId":"'.$user->getId().'",'
                            .'"error": "'.$translator->trans('user.emailSent').'"'
                            .'}', 
                            Response::HTTP_ACCEPTED);
                }
            }
        }
        return $response;
    }
    
    private function encodePassword(User $user){
        $password =  $this->get('security.password_encoder')->encodePassword($user, $user->getPlainPassword());
        $user->setPassword($password);
    }
    
    private function generatePassword() {
        $special = ['_', '-', '.', '$', '!', '?', ','];
        $digits = range(0,9);
        $charsUpper = range('A','Z');
        $charsLower = range('a','z');
        $pass = [];
        
        $len = mt_rand(1, 2);
        for($i = 0; $i < $len; ++$i) {
            $pass[] = $special[mt_rand(0, count($special) - 1)];
        }
        
        $len = mt_rand(1, 3);
        for($i = 0; $i < $len; ++$i) {
            $pass[] = $digits[mt_rand(0, count($digits) - 1)];
        }
        
        $len =  mt_rand(1, 3);
        for($i = 0; $i < $len; ++$i) {
            $pass[] = $charsUpper[mt_rand(0, count($charsUpper) - 1)];
        }
        
        $len = 10 - count($pass);
        for($i = 0; $i < $len; ++$i) {
            $pass[] = $charsLower[mt_rand(0, count($charsLower) - 1)];
        }
        
        shuffle($pass);
        return implode('', $pass);
    }
    
    
    private function sendPassword(User $user) {
        $lang = $this->get('translator')->getLocale();
        $html = $this->renderView(
            '@TutteliAppBundle/Resources/views/User/email.'.$lang.'.html.twig',
            array('user' => $user)
        );
        $message = \Swift_Message::newInstance()
            ->setSubject('New User Account')
            ->setFrom('no-reply@'.$_SERVER['HTTP_HOST'])
            ->setTo($user->getEmail())
            ->setBody($html, 'text/html');
        $this->get('mailer')->send($message);
    }
    
    private function mapUser(User $user, array $data) {
        if (array_key_exists('username', $data)) {
            $user->setUsername($data['username']);
        }
        
        if (array_key_exists('email', $data)) {
            $user->setEmail($data['email']);
        }
        
        if (array_key_exists('roleId', $data)) {
            $user->setRole($data['roleId']);
        }
    }
    
    public function editAction(Request $request, $userId, $ending) {
        $this->denyAccessUnlessAdminOrCurrentUser($userId);
        
        return $this->edit($request, $ending, function() use ($userId) {
            $user = $this->loadEntity($userId);
            if ($user == null) {
                throw $this->createNotFoundException('User with id '.$userId. ' not found.');
            }
            return $user;
        });
    }
    
    private function denyAccessUnlessAdminOrCurrentUser($userId) {
        if (!$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN') && !$this->isCurrentUser($userId)) {
            throw $this->createAccessDeniedException('Unable to access this page!');
        }
    }
    
    private function isCurrentUser($userId) {
        return $this->get('security.token_storage')->getToken()->getUser()->getId() == $userId;
    }
    
    public function editTplAction(Request $request) {
        return $this->edit($request, '.tpl', function(){return null;});
    }
    
    private function edit(Request $request, $ending, callable $getUser) {
        $viewPath = '@TutteliAppBundle/Resources/views/User/edit.html.twig';
        list($etag, $response) = $this->checkEndingAndEtagForView($request, $ending, $viewPath);
        
        if (!$response) {
            $user = $getUser();
            $response = $this->render($viewPath, array (
                    'notXhr' => $ending == '',
                    'error' => null,
                    'user' => $user,
            ));
        
            if ($ending == '.tpl') {
                $response->setETag($etag);
            }
        }
        return $response;
    }

    
    public function putAction(Request $request, $userId) {
        $this->denyAccessUnlessAdminOrCurrentUser($userId);
        
        if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
            $user = $this->loadEntity($userId);
            if ($user != null) {
                return $this->updateUser($request, $user);
            } else{
                return $this->createNotFoundException('User Not Found');
            }
        }
        return new Response('{"msg": "Wrong Content-Type"}', Response::HTTP_BAD_REQUEST);
    }
    
    private function updateUser(Request $request, User $user) {
        list($data, $response) = $this->decodeDataAndVerifyCsrf($request);
        if (!$response) {    
            $oldRole = $user->getRole();
            $this->mapUser($user, $data);
            $validator = $this->get('validator');
            $errors = $validator->validate($user);
            if($oldRole != $user->getRole() 
                    && !$this->get('security.authorization_checker')->isGranted('ROLE_ADMIN')) {
                $errors->add(new ConstraintViolation(
                        'users.changeRoleDenied', 'users.changeRoleDenied', [], $user, 'role', $user->getRole()));
            }
            if (count($errors) > 0) {
                $response = $this->getTranslatedValidationResponse($errors);
            } else {
                $em = $this->getDoctrine()->getManager();
                $em->merge($user);
                $em->flush();
                $response = new Response('', Response::HTTP_NO_CONTENT);
            }
        }
        return $response;
    }

    public function editPasswordAction(Request $request, $userId, $ending) {
        if (!$this->isCurrentUser($userId)) {
            throw $this->createAccessDeniedException('Unable to access this page!');
        }
        return $this->editPassword($request, $userId, $ending);
    }
        
    private function editPassword(Request $request, $userId, $ending) {        
        $viewPath = '@TutteliAppBundle/Resources/views/User/pass.html.twig';
        list($etag, $response) = $this->checkEndingAndEtagForView($request, $ending, $viewPath);
        
        if (!$response) {
            $response = $this->render($viewPath, array (
                    'notXhr' => $ending == '',
                    'error' => null,
                    'userId' => $userId
            ));
        
            if ($ending == '.tpl') {
                $response->setETag($etag);
            }
        }
        return $response;
    }
    
    public function editPasswordTplAction(Request $request) {
        return $this->editPassword($request, 0, '.tpl');
    }
    
    public function putPasswordAction(Request $request, $userId) {
        if (!$this->isCurrentUser($userId)) {
            throw $this->createAccessDeniedException('Unable to access this page!');
        }
        
        if (0 === strpos($request->headers->get('Content-Type'), 'application/json')) {
            $user = $this->loadEntity($userId);
            return $this->changePassword($request, $user);        
        }
        return new Response('{"msg": "Wrong Content-Type"}', Response::HTTP_BAD_REQUEST);
    }
    
    public function changePassword(Request $request, User $user) {
        list($data, $response) = $this->decodeDataAndVerifyCsrf($request);
        if (!$response) {
            $changePw = new ChangePasswordDto();
            $this->mapPw($changePw, $data);
            $validator = $this->get('validator');
            $errors = $validator->validate($changePw);
            if (count($errors) > 0) {
                $response = $this->getTranslatedValidationResponse($errors);
            } else {
                $user->setPlainPassword($data['newPw']);
                $this->encodePassword($user);
                $em = $this->getDoctrine()->getManager();
                $em->merge($user);
                $em->flush();
                $response = new Response('', Response::HTTP_NO_CONTENT);
            }
        }
        return $response;       
    }
    
    private function mapPw(ChangePasswordDto $dto, $data) {
        if(array_key_exists('oldPw', $data)) {
            $dto->oldPw = $data['oldPw'];
        }
        
        if(array_key_exists('newPw', $data)) {
            $dto->newPw = $data['newPw'];
        }
        
        if(array_key_exists('repeatPw', $data)) {
            $dto->repeatPw = $data['repeatPw'];
        }
    }
}
