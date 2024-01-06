/*
 * All content copyright http://www.j2eefast.com, unless
 * otherwise indicated. All rights reserved.
 * No deletion without permission
 */
package com.j2eefast.framework.config;

import com.j2eefast.common.core.base.entity.LoginUserEntity;
import com.j2eefast.common.core.utils.ToolUtil;
import com.j2eefast.framework.utils.Constant;
import com.j2eefast.framework.utils.UserUtils;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.PathMatcher;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Map;

/**
 * 锁屏拦截器
 * @author zhouzhou
 * @date 2020/1/18 12:25
 */
@Component
public class LockHandlerInterceptorAdapter extends HandlerInterceptorAdapter {

	@Autowired
	@Lazy
	private ShiroFilterFactoryBean shiroFilterFactoryBean;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
		String requestUrl = request.getServletPath();
		try{
			if(UserUtils.getSubject().isAuthenticated()){
				String ___unlock = "__unlock";
				String _unlock   = "unlock";
				String __unlock  = "_unlock";
				String outLock   = "/Account/Lock";
				//是否屏保登陆页面跳转来
				String unlock = (String) UserUtils.getSessionAttribute(__unlock);
				if(ToolUtil.isNotEmpty(unlock) && unlock.equals(_unlock)){
					request.setAttribute(__unlock, "1");
					UserUtils.removeSessionAttribute(___unlock);
				}
				LoginUserEntity loginUser = UserUtils.getUserInfo();
				Map<String, String> filterMap = shiroFilterFactoryBean.getFilterChainDefinitionMap();
				filterMap.put(Constant.RESOURCE_URLPREFIX + "/**","anon");
				filterMap.put("/logout","anon");
				filterMap.put("/error","anon");
				filterMap.put("/Account/login","anon");
				for(String key:filterMap.keySet()){
					String value = filterMap.get(key).toString();
					PathMatcher matcher = new AntPathMatcher();
					if(value.equals("anon") && matcher.match(key,requestUrl)){
						return super.preHandle(request,response,handler);
					}
				}
				if(ToolUtil.isNotEmpty(loginUser.getLoginStatus()) && 
						loginUser.getLoginStatus().equals(-1) && !requestUrl.equals(outLock)){
					response.sendRedirect( request.getContextPath() +outLock);
					return false;
				}
			}
			return super.preHandle(request,response,handler);
		}catch (Exception e){
			return super.preHandle(request,response,handler);
		}
    }
}
