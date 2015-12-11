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


class UserController extends ATplController {

    protected function getCsrfTokenDomain() {
        return 'user';
    }
    
    public function cgetAction(Request $request, $ending) {
        $viewPath = '@TutteliAppBundle/Resources/views/User/cget.html.twig';
        list($etag, $response) = $this->checkEndingAndEtagForView($request, $ending, $viewPath);
    
        if (!$response) {
            $users = $this->loadUsers();
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
        return '{'
                .'"id":"'.$user->getId().'",'
                .'"username":"'.$user->getUsername().'",'
                .'"email":"'.$user->getEmail().'",'
                .'"role":"'.$user->getRole().'"'                                
                .'}';
    }
    
    public function getJsonAction($userId) {
        $user = $this->loadUser($userId);
        return new Response('{"user":'.$this->getJson($user).'}');
    }

    public function editAction(Request $request, $userId, $ending) {
        return $this->edit($request, $ending, function() use ($userId) {
            return $this->loadUser($userId);
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
        
    }
    
    public function newAction() {
        return $this->renderUserForm($this->getForm());
    }

    private function getForm(User $user = null) {
        return $this->createForm(new UserType(), $user, ['action' => $this->generateUrl('post_users')]);
    }

    private function renderUserForm(\Symfony\Component\Form\Form $form) {
        $view = $this->view($form, 200)
            ->setTemplate("TutteliAppBundle:User:new.html.twig")
            ->setTemplateVar("form");
        return $this->handleView($view);
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
