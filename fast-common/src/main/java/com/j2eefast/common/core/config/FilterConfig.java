/**
 * Copyright (c) 2020-Now http://www.j2eefast.com All rights reserved.
 * No deletion without permission
 */
package com.j2eefast.common.core.config;

import cn.hutool.core.util.StrUtil;
import com.j2eefast.common.core.xss.XssFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import javax.servlet.DispatcherType;
import java.util.HashMap;
import java.util.Map;


/**
 * Filter配置
 * @author: zhouzhou Emall:loveingowp@163.com
 * @date: 2019-03-24 22:01
 */
@Configuration
public class FilterConfig {

	@Value("${fast.xss.enabled}")
	private String enabled;

	@Value("${fast.xss.excludes}")
	private String excludes;

	@Value("${fast.xss.urlPatterns}")
	private String urlPatterns;


	@SuppressWarnings({ "rawtypes", "unchecked" })
	@Bean
	public FilterRegistrationBean xssFilterRegistration(){
		FilterRegistrationBean registration = new FilterRegistrationBean();
		registration.setDispatcherTypes(DispatcherType.REQUEST);
		registration.setFilter(new XssFilter());
		registration.addUrlPatterns(StrUtil.split(urlPatterns, ","));
		registration.setName("xssFilter");
		registration.setOrder(Integer.MAX_VALUE -1);
		Map<String, String> initParameters = new HashMap<String, String>();
		initParameters.put("excludes", excludes);
		initParameters.put("enabled", enabled);
		registration.setInitParameters(initParameters);
		return registration;
	}
}
