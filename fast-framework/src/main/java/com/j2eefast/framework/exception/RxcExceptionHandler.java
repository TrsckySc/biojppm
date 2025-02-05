/*
 * All content copyright http://www.j2eefast.com, unless
 * otherwise indicated. All rights reserved.
 * No deletion without permission
 */
package com.j2eefast.framework.exception;

import com.j2eefast.common.core.utils.ResponseData;
import com.j2eefast.common.core.utils.ToolUtil;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authz.AuthorizationException;
import org.mybatis.spring.MyBatisSystemException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.BadSqlGrammarException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.alibaba.excel.exception.ExcelAnalysisException;
import com.j2eefast.common.core.exception.RxcException;
import freemarker.core.InvalidReferenceException;

/**
 * 项目全局异常处理器
 * @author zhouzhou
 */
@RestControllerAdvice
public class RxcExceptionHandler {
	private Logger logger = LoggerFactory.getLogger(getClass());

	/**
	 * 处理自定义异常
	 */
	@ExceptionHandler(RxcException.class)
	@ResponseStatus(HttpStatus.UNAUTHORIZED)
	public ResponseData handleRxcException(RxcException e) {
		logger.error("异常 代码[{}] 异常信息[{}]",e.getCode(),e.getMessage());
		ResponseData r = new ResponseData();
		r.put("code", e.getCode());
		r.put("msg", e.getMsg());
		return r;
	}

	/**
	 * 数据库记录数据存在
	 * @author ZhouZhou
	 * @date 2020-12-06 19:16
	 * @param e
	 * @return
	 */
	@ExceptionHandler(DuplicateKeyException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ResponseData handleDuplicateKeyException(DuplicateKeyException e) {
		logger.error(e.getMessage(), e);
		return ResponseData.error("数据库中已存在该记录");
	}
	
	@ExceptionHandler(AuthenticationException.class)
	@ResponseStatus(HttpStatus.UNAUTHORIZED)
	public ResponseData handleAuthenticationException(AuthenticationException e) {
		logger.error(e.getMessage());
		return ResponseData.error("授权报错");
	}

	@ExceptionHandler(AuthorizationException.class)
	@ResponseStatus(HttpStatus.UNAUTHORIZED)
	public ResponseData handleAuthorizationException(AuthorizationException e) {
		logger.error("没有权限，请联系管理员授权---->" + e.getMessage());
		return ResponseData.error("50001","没有权限，请联系管理员授权");
	}
	
	@ExceptionHandler(InvalidReferenceException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ResponseData handInvalidReferenceException(InvalidReferenceException e) {
		logger.error("Freemarker 模板引擎报错---->" + e.getMessage());
		return ResponseData.error("Freemarker报错,检查HTML页面标签");
	}

	@ExceptionHandler(Exception.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ResponseData ResponseDatahandleException(Exception e) {
		if(("Request method 'GET' not supported").equals(e.getMessage())) {
			return ResponseData.error("20000","请求不可用");
		}
		logger.error(e.getMessage(),e);
		if(ToolUtil.isEmpty(e.getMessage())){
			return ResponseData.error("服务器异常!");
		}
		return ResponseData.error(e.getMessage());
	}
	
	/**
	 * 阿里报表异常捕获
	 * @date 2021-09-30 15:14
	 * @param e
	 * @return
	 */
	@ExceptionHandler(ExcelAnalysisException.class)
	@ResponseStatus(HttpStatus.BAD_REQUEST)
	public ResponseData ResponseExcelAnalysisException(Exception e) {
		if(e.getCause() instanceof  RxcException){
			return ResponseData.error(((RxcException) e.getCause()).getCode(),((RxcException) e.getCause()).getMsg());
		}
		return ResponseData.error(e.getMessage());
	}

	@ExceptionHandler(BadSqlGrammarException.class)
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	public ResponseData ResponseDatahandleSQLSyntaxErrorException(Exception e) {
		logger.error("操作数据库异常:",e);
		return ResponseData.error("数据库异常请检查服务器");
	}

	@ExceptionHandler(MyBatisSystemException.class)
	@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
	public ResponseData ResponseDatahandleSQLMyBatisSystemException(Exception e) {
		logger.error("操作数据库异常:",e);
		return ResponseData.error("数据库异常请检查服务器");
	}
}
