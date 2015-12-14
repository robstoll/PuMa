<?php
/*
 * This file is part of the project tutteli/purchase published under the Apache License 2.0
 * For the full copyright and license information, please have a look at LICENSE in the
 * root folder or visit https://github.com/robstoll/purchase
 */

namespace Tutteli\AppBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Tutteli\AppBundle\Entity\User;
use Tutteli\AppBundle\Form\UserType;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\Exception\UnsupportedException;
use Symfony\Component\Security\Core\Util\SecureRandom;
use Symfony\Component\Validator\ConstraintViolation;

class UserController extends ATplController {

    protected function getCsrfTokenDomain() {
        return 'user';
    }
    
    public function cgetAction(Request $request, $ending) {
        $viewPath = '@TutteliAppBundle/Resources/views/User/cget.html.twig';
        list($etag, $response) = $this->checkEndingAndEtagForView($request, $ending, $viewPath);
    
        if (!$response) {
            $users = null;
            if ($ending != '.tpl') {
                $users = $this->loadUsers();
            }
            $response = $this->render($viewPath, array (
                    'notXhr' => $ending == '',
                    'users' => $users
            ));
    
            if ($ending == '.tpl') {
                $response->setETag($etag);
            }
        }
        return $response;
    }
    
    public function cgetJsonAction() {
        $users = $this->loadUsers();
        return new Response($this->getJsonArray($users));
    }
        
    private function loadUsers() {
        $repository = $this->getDoctrine()->getRepository('TutteliAppBundle:User');
        return $repository->findAll();
    }
    
    private function getUserRepository() {
        return $this->getDoctrine()->getRepository('TutteliAppBundle:User');
    }

    private function loadUser($userId) {
        $repository = $this->getUserRepository();
        return $repository->find($userId);
    }

    private function getJsonArray(array $data) {
        $list = '{"users":[';
        $count = count($data);
        if ($count > 0) {
            for ($i = 0; $i < $count; ++$i) {
                if ($i != 0) {
                    $list .= ',';
                }
                /* @var $user \Tutteli\AppBundle\Entity\User */
                $user = $data[$i];
                $list .= $this->getJson($user);
            }
        }
        $list .= ']}';
        return $list;
    }
    
    private function getJson(User $user) {
         $translator = $this->get('translator');
        return '{'
                .'"id":"'.$user->getId().'",'
                .'"username":"'.$user->getUsername().'",'
                .'"email":"'.$user->getEmail().'",'
                .'"roleId":"'.$user->getRole().'",'
                .'"role":"'.$translator->trans('users.roles.'.$user->getRole()).'"'                        
                .'}';
    }
    
    public function getJsonAction($userId) {
        $user = $this->loadUser($userId);
        return new Response('{"user":'.$this->getJson($user).'}');
    }

    public function newAction(Request $request, $ending) {
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
            $password =  $this->get('security.password_encoder')->encodePassword($user, $user->getPlainPassword());
            $user->setPassword($password);
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
        return $this->edit($request, $ending, function() use ($userId) {
            $user = $this->loadUser($userId);
            if ($user == null) {
                throw $this->createNotFoundException('User with id '.$userId. ' not found.');
            }
            return $user;
        });
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

    
    public function putAction(Request $request) {
        throw new UnsupportedException();
    }
    
    public function cpostAction(Request $request) {
        $user = new User();
        $form = $this->createForm(new UserType(), $user);

        $form->handleRequest($request);

        if ($form->isValid()) {
            $password = $this->get('security.password_encoder')->encodePassword($user, $user->getPlainPassword());
            $user->setPassword($password);
            $em = $this->getDoctrine()->getManager();
            $em->persist($user);
            $em->flush();
            return $this->redirectView(
                    $this->generateUrl('get_user', array('id' => $user->getId())), Response::HTTP_CREATED);

        }

        return $this->renderUserForm($form);
    }

    public function getAction($id) {
        $repository = $this->getDoctrine()->getRepository('TutteliAppBundle:User');
        $data = $repository->findAll();
        $view = $this->view($data, 200)
            ->setTemplate("TutteliAppBundle:User:cget.html.twig")
            ->setTemplateVar('users');
        return $this->handleView($view);
    }

}
