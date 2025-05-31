/*
 * All content copyright http://www.j2eefast.com, unless 
 * otherwise indicated. All rights reserved.
 * No deletion without permission
 */
package com.j2eefast.framework.exception;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @author huanzhou
 */
@Controller
public class NotFoundException implements ErrorController {

	private static final String ERROR_PATH = "/error";

	@RequestMapping(ERROR_PATH)
    public String error(){
        return "404.html";
    }

}
