package com.j2eefast.framework.config;

import java.util.List;
import java.util.Locale;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.alibaba.druid.pool.DruidDataSource;
import com.alibaba.druid.support.http.StatViewServlet;
import com.alibaba.druid.support.http.WebStatFilter;
import com.alibaba.druid.support.spring.stat.DruidStatInterceptor;
import com.j2eefast.common.core.adapter.SecurityKeyInterceptorAdapter;
import com.j2eefast.common.core.constants.ConfigConstant;
import com.j2eefast.common.core.license.interceptor.LicenseCheckInterceptor;
import com.j2eefast.common.core.utils.CookieUtil;
import com.j2eefast.framework.interceptor.RepeatSubmitInterceptor;
import com.j2eefast.framework.utils.Constant;
import com.alibaba.druid.support.spring.stat.BeanTypeAutoProxyCreator;
import com.alibaba.druid.support.spring.stat.DruidStatInterceptor;
import com.j2eefast.framework.utils.Global;
import org.springframework.aop.Advisor;
import org.springframework.aop.support.DefaultPointcutAdvisor;
import org.springframework.aop.support.JdkRegexpMethodPointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.context.request.RequestContextListener;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.j2eefast.common.core.utils.ToolUtil;
import org.springframework.boot.web.servlet.ServletRegistrationBean;

/**
 * WebMvc配置
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {



	@Value("${spring.messages.defaultLocale: zh_CN}")
	private String defaultLocale;
	@Autowired
	private SecurityKeyInterceptorAdapter securityKeyInterceptorAdapter;

    @Autowired
    private LockHandlerInterceptorAdapter lockHandlerInterceptorAdapter;

    @Autowired
    private RepeatSubmitInterceptor repeatSubmitInterceptor;

    @Autowired
    private LicenseCheckInterceptor LicenseCheckInterceptor;
	
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {


	    registry.addResourceHandler("/i18n/**").addResourceLocations("classpath:/i18n/");
        registry.addResourceHandler("/static/**").addResourceLocations("classpath:/static/");
        /**工作流资源拦截 若不用可以屏蔽*/
		registry.addResourceHandler("/flowable/**").addResourceLocations("classpath:/flowable/");
        /** 本地文件上传路径 */
        registry.addResourceHandler(Constant.RESOURCE_urlPrefix + "/**").addResourceLocations("file:" + Global.getRootPath());
	}

//    /**
//     * web跨域访问配置
//     */
//    @Override
//    public void addCorsMappings(CorsRegistry registry)
//    {
//        // 设置允许跨域的路径
//        registry.addMapping("/**")
//                // 设置允许跨域请求的域名
//                .allowedOrigins("*")
//                // 是否允许证书
//                .allowCredentials(true)
//                // 设置允许的方法
//                .allowedMethods("GET", "POST", "DELETE", "PUT")
//                // 设置允许的header属性
//                .allowedHeaders("*")
//                // 跨域允许时间
//                .maxAge(3600);
//    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(LicenseCheckInterceptor).addPathPatterns("/**");
    	registry.addInterceptor(securityKeyInterceptorAdapter).addPathPatterns("/**");
        registry.addInterceptor(lockHandlerInterceptorAdapter).addPathPatterns("/**");
        registry.addInterceptor(repeatSubmitInterceptor).addPathPatterns("/**");
    }
    
	@Override
	public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
		MappingJackson2HttpMessageConverter jackson2HttpMessageConverter = new MappingJackson2HttpMessageConverter();
		ObjectMapper objectMapper = jackson2HttpMessageConverter.getObjectMapper();

		// 生成json时，将所有Long转换成String
		SimpleModule simpleModule = new SimpleModule();
		simpleModule.addSerializer(Long.class, ToStringSerializer.instance);
		simpleModule.addSerializer(Long.TYPE, ToStringSerializer.instance);
		objectMapper.registerModule(simpleModule);

		jackson2HttpMessageConverter.setObjectMapper(objectMapper);
		converters.add(0, jackson2HttpMessageConverter);
	}


	
	/**
	 * 配置国际化参数
	 */
	@Bean
    public LocaleResolver localeResolver(){
        return new NativeLocaleResolver(defaultLocale);
    }

	/**
	 * RequestContextListener注册
	 */
	@Bean
	public ServletListenerRegistrationBean<RequestContextListener> requestContextListenerRegistration() {
		return new ServletListenerRegistrationBean<>(new RequestContextListener());
	}
	
	protected static class NativeLocaleResolver implements LocaleResolver{
		private String defaultLocale;

		public NativeLocaleResolver(String defaultLocale){
			this.defaultLocale = defaultLocale;
		}

        @Override
        public Locale resolveLocale(HttpServletRequest request) {
			String language = request.getParameter(ConfigConstant.LANGUAGE);
			Locale locale = null;
			if(ToolUtil.isNotEmpty(language)){
				String[] split = language.split("_");
				locale = new Locale(split[0],split[1]);
			}else {
				language = CookieUtil.getCookie(request,ConfigConstant.LANGUAGE);
				if(ToolUtil.isNotEmpty(language)){
					String[] split = language.split("_");
					locale = new Locale(split[0],split[1]);
				}else{
					String[] split = defaultLocale.split("_");
					locale = new Locale(split[0],split[1]);
				}
			}
			return locale;
        }

        @Override
        public void setLocale(HttpServletRequest request, HttpServletResponse response, Locale locale) {
//        	Cookie c1 = new Cookie("_lang",locale.getLanguage()); 
//        	c1.setMaxAge(60*60*24*7);
//            response.addCookie(c1);
        	
//        	System.out.println("//////////////////////////////////language:");
        }
    }
}
