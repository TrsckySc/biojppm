/*
 * All content copyright http://www.j2eefast.com, unless 
 * otherwise indicated. All rights reserved.
 * No deletion without permission
 */
package com.j2eefast.common.core.constants;

import com.google.common.collect.Lists;
import com.j2eefast.common.core.utils.HexUtil;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 系统常量
 * @author zhouzhou
 * @date 2020-03-15 11:12
 */
public final class ConfigConstant {

	public static final String 					TIPS_END 							= "若想忽略此提示，请在系统工具->参数管理，设置相关参数！";
	public static final String 					DEOM_MODE_PROMPT 					= "演示模式,禁止操作!";
	public static final String 					REQUEST_PROMPT 						= "客户端请求异常拦截!";
	public static final String					DEOM_MODE_SHOW						= "*** 演示模式，不展示数据 ***";
	public static String 						FAST_OS_SN							= "";
	public static Boolean						FAST_IPIS							= true;
	public static List<String> 					FAST_IPS							= null;
	public static final String 					POST								= "POST";
	public static final String 					GET									= "GET";
	public static byte[] 						FAST_MAC_KEY						= HexUtil.decodeHex("BF8F83A656BD75925379384E454DD174");
	public static byte[] 						FAST_KEY							= HexUtil.decodeHex("62D95F5BA8E44064231018DF8A9EE027");
	public static String 						KEY									= "D605C20574179E9F3526BC9076D77AE9";
	public static byte[] 						FAST_VERIFY_KEY						= HexUtil.decodeHex("00000000000000000000000000000000");
	public static String 						AUTHORIZATION_TIME					= "";
	public static final String 					CONSTANT 							= "CONSTANT";
	public static final String 					CTX_STATIC							= "ctxStatic";
	public static final String 					BASE_PATH							= "basePath";
	public static final String 					FAST_SESSION_ID						= "fast.session.id";
	public static final String 					JTA_ENABLED_YML 					= "fast.jta.enabled";
	public static final String 					UREPORT_ENABLED_YML 				= "fast.ureport.enabled";
	public static final String 					SYS_KEY_PUBKEY 						= "shiro.sysKey.pubKey";
	public static final String 					SYS_KEY_PRIKEY 						= "shiro.sysKey.priKey";
	public static final String 					TRUE 								= "true";
	public static final String 					FLOWABLE_ENABLED_YML 				= "fast.flowable.enabled";
	public static final String 					TENANTMODEL 						= "fast.tenantModel.enabled";
	public static final String					IGNORETABLE 				        = "fast.tenantModel.ignoreTable";
	public static final String 				    SERVER_SERVLET_CONTEXTPATH          = "server.servlet.context-path";
	public static final String					FAST_LOGIN_CSRF_TOKEN				= "FAST_LOGIN_CSRF_TOKEN";
	public static final String					SHIRO_SESSION_ID					= "shiro:session:";
	public static final String 					SQLFILTER 							= "sqlFilter";
	public static final String 					SQL_FILTER 							= "sql_filter";
	public static byte[]                  		PRIVKEY								= HexUtil.decodeHex("a1ab63f9b726482d47d7529b4bdb57fbdd68c492d19cf8e3f1140fb68d193f7b");
	public static String                  		PUBKEY								= "QTwb20ZMEftb9jFnjgRBCULM7+LmKW+x/3wpuIOuVLTeHTkivKZVX8QNBGeexn5EDeymBaWbEgU/IGAyqofN3w==";
	public static String						I18N_ATG							= "";
	public static String						DICT_TAG							= "";
	public static String 						LIC_TAG								= "NULL";
	
	/**
	 *  系统多租户忽略添加租户ID的表
	 *  也可以称为多租户数据共享表 具体可以参考数据表描述
	 *  -- 若还需要添加请在配置文件xml 配置,此处为系统配置禁止修改,若修改请自行维护
	 */
	public static final List<String>  		    IGNORE_TABLE_NAMES 				    = Lists.newArrayList(
			"sys_config",/* 系统参数表*/
			"sys_module",/* 模块表*/
			"sys_job", /* 任务表*/
			"sys_user_post","sys_dict_data","sys_tenant","sys_index","sys_role_menu","sys_role_module","sys_role_dept",
			"sys_dict_type","sys_menu","sys_area","sys_user_role","tables","columns","gen_table_column",
			"sys_job_log","sys_notice","sys_msg_push","sys_msg_push_user","sys_file_upload","sys_msg_cc_user",
			"extended_properties","sys_lang",
			"act_*", /* 所有工作流表*/
			"gen_table","sys_database","gen_edit_code"
	);

	/**
	 * 系统名称
	 */
	public static final List<String> J2_E_E_F_A_S_T =  Lists.newArrayList("J2","e","e","F","A","S","T");

	/**
	 * 登录安全key
	 */
	public static final String 					SECRETKEY 							= "_secretKey";
	public static final String 					LANGUAGE							= "_lang";

	/**
	 * 数据源容器
	 */
	public static Map<Object, Object> DATA_SOURCES = new ConcurrentHashMap<>();
	/**
	 * 资源映射路径 前缀
	 */
//	public static final String 					RESOURCE_URLPREFIX 					= "/profile";
	
	
	/**********************************系统参数配置常量**********************************************************************/
	/**
	 * 云存储配置KEY
	 */
	public final static String CLOUD_STORAGE_CONFIG_KEY = "CLOUD_STORAGE_CONFIG_KEY";
	/**
	 * API服务器
	 */
	public final static String CLOUD_CONFIG_APP = "CLOUD_CONFIG_APP";

	public final static String SMSKEY 		= "SYS_SMS_CONFIG";
	
	public final static String SYS_CONFIG_TITLE = "SYS_CONFIG_TITLE" ;
	
	public final static String SYS_CONFIG_ROOT_PATH ="SYS_CONFIG_ROOT_PATH" ;

	public final static String SYS_CONFIG_EDITOR_PATH =  "SYS_CONFIG_EDITOR_PATH" ;
	
	public final static String SYS_CONFIG_ATTACH_PATH = "SYS_CONFIG_ATTACH_PATH"; 
	
	public final static String SYS_CONFIG_TEMP_PATH = "SYS_CONFIG_TEMP_PATH"; 
	
	/**
	 * 登录安全认证
	 */
	public final static String SYS_LOGIN_VERIFICATION = "SYS_LOGIN_VERIFICATION";
	
	/**
	 * 登录默认页面风格
	 */
	public final static String SYS_LOGIN_DEFAULT_VIEW = "SYS_LOGIN_DEFAULT_VIEW";
	
	/**
	 * 登录验证码类型
	 */
	public final static String  SYS_LOGIN_CAPTACHA_TYPE = "SYS_LOGIN_CAPTACHA_TYPE";

	/**
	 * 输出前端页面是否压缩
	 */
	public final static String SYS_COMPRESS = "SYS_COMPRESS";

	/**
	 * 版本号
	 */
	public final static String SYS_VERSION = "version";

	public final static String CONFIG_KEY  = "sys:cfg:version";
	
	/**
	 * JS CSS版本
	 */
	public final static String SYS_CONFIG_DV_VERSION = "SYS_CONFIG_DV_VERSION";
	/**
	 * 系统参数
	 */
	
	public final static String SYS_CONFIG_KEY = "SYS_CONFIG_KEY";
	
	
	/**
	 * 短信登录
	 */
	public final static String SYS_LOGIN_SMS = "SYS_LOGIN_SMS";
	
	/**
	 * 支付参数
	 */
	public final static String PAY_CONFIG_KEY = "PAY_CONFIG_KEY";

	/**
	 * 登录排挤
	 */
	public final static String SYS_IS_LOGIN = "SYS_IS_LOGIN";

}
