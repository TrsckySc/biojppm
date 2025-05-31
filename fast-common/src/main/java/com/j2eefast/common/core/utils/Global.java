/*
 * All content copyright http://www.j2eefast.com, unless
 * otherwise indicated. All rights reserved.
 * No deletion without permission
 */
package com.j2eefast.common.core.utils;

import java.io.File;
import com.j2eefast.common.config.service.SysConfigService;
import com.j2eefast.common.core.io.PropertiesUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.j2eefast.common.core.constants.ConfigConstant;
import cn.hutool.core.convert.Convert;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONObject;
import cn.hutool.json.JSONUtil;
import cn.hutool.setting.Setting;

/**
 * 获取系统配置参数
 * @author zhouzhou loveingowp@163.com
 * @data 2019-04-05 19:44
 */
public class Global {
	
	private static final Logger log = LoggerFactory.getLogger(Global.class);

	/**
     * 获取配置
     */
    public static String  getConfig(String key){
    	try{
    		return SpringUtil.getBean(SysConfigService.class).getConfigObject(key, String.class);
        }catch (Exception e){
        	log.error("获取配置错误!", e);
        	return null;
        }
    }
    
    
    /**
     * 获取项目版本
     */
    public static String getVersion(){
        String  version = SpringUtil.getBean(RedisUtil.class).get(ConfigConstant.CONFIG_KEY);
        if(ToolUtil.isEmpty(version)){
            version = PropertiesUtils.getInstance().getProperty(ConfigConstant.SYS_VERSION,"1.0.1");
            SpringUtil.getBean(RedisUtil.class).set(ConfigConstant.CONFIG_KEY,version);
        }
    	return version;
    }
    
    /**
     * @Description:样式JS 版本
     * @author zhouzhou loveingowp@163.com
     * @time 2019-04-28 22:17
     * @return
     *
     */
    public static String getDvVersion(){
    	return StrUtil.blankToDefault(getConfig(ConfigConstant.SYS_CONFIG_DV_VERSION),"20190425");
    }
    
    /**
     * 获取后台系统标题
     */
    public static String getTitle() {
    	
    	return StrUtil.blankToDefault(getConfig(ConfigConstant.SYS_CONFIG_TITLE),"FAST云系统OS");
    }
    
    
    public static String getDbKey(String key) {
    	return StrUtil.blankToDefault(getConfig(key),"默认值[获取数据库值失败]");
    }

    public static String getDbKey(String key,String default0) {
        return StrUtil.blankToDefault(getConfig(key),default0);
    }

    /**
    * @Title: getRootPath 
    * @Description:项目文件根路径
    * @author mfksn001@163.com
    * @Date: 2020年8月13日
     */
    public static String getRootPath() {
    	
    	return StrUtil.blankToDefault(getConfig(ConfigConstant.SYS_CONFIG_ROOT_PATH),"D:/fast/");
    }

    /**
     * 获取富文本组件上传根路径 editor
     */
    public static String getEditorPath()
    {
        return StrUtil.blankToDefault(getConfig(ConfigConstant.SYS_CONFIG_EDITOR_PATH),getRootPath()+"editor");
    }

    
    /**
     * 用户头像上传路径
     */
    public static String getAvatarPath()
    {
        return  getRootPath() + "avatar";
    }

    /**
     * temp 临时根目录
      */
    public static String getTempPath()
    {
        return StrUtil.blankToDefault(getConfig(ConfigConstant.SYS_CONFIG_TEMP_PATH),getRootPath()+"temp");
    }

    /**
     * attach 上传组件根目录
      */
    public static String getAttachPath()
    {
        return StrUtil.blankToDefault(getConfig(ConfigConstant.SYS_CONFIG_ATTACH_PATH),getRootPath()+"attach");
    }

    public static boolean optimize(){
        return StrUtil.blankToDefault(getConfig(ConfigConstant.SYS_COMPRESS),"false").equals("true")?true:false;
    }

    /**
     * 登陆密码错误次数
     */
    public static int getLoginMaxCount() {
    	
    	String jsonStr = StrUtil.blankToDefault(getConfig(ConfigConstant.SYS_CONFIG_KEY),
    			"{\"login_maxCount\":5,\"lock_time\":30}");
    	
    	//JSON 格式转换
    	JSONObject array = JSONUtil.parseObj(jsonStr);
    	
    	//获取登陆最大错误次数
    	return array.getInt("login_maxCount",5);
    }
    
    /**
     * 登陆错误次数需要输入验证码
     */
    public static int getLoginNumCode() {
    	
    	String jsonStr = StrUtil.blankToDefault(getConfig(ConfigConstant.SYS_CONFIG_KEY),
    			"{\"login_NumCount\":5,\"lock_time\":30}");
    	
    	//JSON 格式转换
    	JSONObject array = JSONUtil.parseObj(jsonStr);
    	
    	//获取登陆最大错误次数
    	return array.getInt("login_NumCount",5);
    }
    
    /**
     * 是否支持短信登录
     * @author ZhouZhou
     * @return
     */
    public static boolean isValidCode() {
    	
    	String jsonStr = StrUtil.blankToDefault(getConfig(ConfigConstant.SYS_LOGIN_SMS),
    			"{\"isLogin\":1,\"validity\":5,\"rate\":1,\"templateId\":\"1134302\"}");
    	//JSON 格式转换
    	JSONObject array = JSONUtil.parseObj(jsonStr);
    	
    	return array.getInt("isLogin",0) == 1;
    }
    
    /**
     * 是否需要验证码获取短信 防止恶意发送验证码
     * @author ZhouZhou
     * @date 2021-10-12 10:23
     * @return
     */
    public static boolean isValidationCode() {
    	String jsonStr = StrUtil.blankToDefault(getConfig(ConfigConstant.SYS_LOGIN_SMS),
    			"{\"isLogin\":1,\"validity\":5,\"rate\":1,\"isValidationCode\":1,\"templateId\":\"1134302\"}");
    	//JSON 格式转换
    	JSONObject array = JSONUtil.parseObj(jsonStr);
    	
    	return array.getInt("isValidationCode",0) == 1;
    }
    
    /**
     * 短信验证码有效期
     * @author ZhouZhou
     * @date 2021-09-23
     * @return
     */
    public static Long Validity() {
    	String jsonStr = StrUtil.blankToDefault(getConfig(ConfigConstant.SYS_LOGIN_SMS),
    			"{\"isLogin\":1,\"validity\":5,\"rate\":1,\"templateId\":\"1134302\"}");
    	//JSON 格式转换
    	JSONObject array = JSONUtil.parseObj(jsonStr);
    	
    	return Convert.toLong(array.getInt("validity",5)*60);
    }

    public static Integer validityInt() {
        String jsonStr = StrUtil.blankToDefault(getConfig(ConfigConstant.SYS_LOGIN_SMS),
                "{\"isLogin\":1,\"validity\":5,\"rate\":1,\"templateId\":\"1134302\"}");
        //JSON 格式转换
        JSONObject array = JSONUtil.parseObj(jsonStr);

        return array.getInt("validity",5);
    }


    /**
     * 限制频率
     * @date 2021-09-23
     * @return
     */
    public static Long smsRate() {
    	String jsonStr = StrUtil.blankToDefault(getConfig(ConfigConstant.SYS_LOGIN_SMS),
    			"{\"isLogin\":1,\"validity\":5,\"rate\":1,\"templateId\":\"1134302\"}");
    	//JSON 格式转换
    	JSONObject array = JSONUtil.parseObj(jsonStr);
    	
    	return Convert.toLong(array.getInt("rate",5) * 60);
    }
    
    
    
    /**
     * 模板ID
     * @author ZhouZhou
     * @date 2021-09-23
     * @return
     */
    public static String loginSmsTemplateId() {
    	String jsonStr = StrUtil.blankToDefault(getConfig(ConfigConstant.SYS_LOGIN_SMS),
    			"{\"isLogin\":1,\"validity\":5,\"rate\":1,\"templateId\":\"1134302\"}");
    	//JSON 格式转换
    	JSONObject array = JSONUtil.parseObj(jsonStr);
    	
    	return array.getStr("templateId","1134302");
    }
    
    /**
     * 单位(分钟) 禁止30分钟
     *
     */
    public static int getLockTime() {
    	
    	String jsonStr = StrUtil.blankToDefault(getConfig(ConfigConstant.SYS_CONFIG_KEY),
    			"{\"login_maxCount\":5,\"lock_time\":30}");
    	//JSON 格式转换
    	JSONObject array = JSONUtil.parseObj(jsonStr);
    	
    	//禁止登陆账户时间
    	return array.getInt("lock_time",30);
    }


    /**
     * 所属公司
     *
     */
    public static String getCompany() {
    	
    	String jsonStr = StrUtil.blankToDefault(getConfig(ConfigConstant.SYS_CONFIG_KEY),
    			"{\"lock_time\":30,\"company\":\"www.j2eefast.com\"}");
    	
    	//JSON 格式转换
    	JSONObject array = JSONUtil.parseObj(jsonStr);
    	
    	//所属公司
    	return array.getStr("company","www.j2eefast.com");
    }
    
    /**
     * 获取版权年份
     *
     */
    public static String getCopyrightYear() {
    	
    	String jsonStr = StrUtil.blankToDefault(getConfig(ConfigConstant.SYS_CONFIG_KEY),
    			"{\"company\":\"www.j2eefast.com\",\"copyrightYear\":\"2019\"}");
    	
    	//JSON 格式转换
    	JSONObject array = JSONUtil.parseObj(jsonStr);
    	
    	//版权年份
    	return array.getStr("copyrightYear","2019");
    }
    
    public static String getIPC() {
    	String jsonStr = StrUtil.blankToDefault(getConfig(ConfigConstant.SYS_CONFIG_KEY),
    			"{\"company\":\"www.j2eefast.com\",\"ipc\":\"\"}");
    	
    	//JSON 格式转换
    	JSONObject array = JSONUtil.parseObj(jsonStr);
    	
    	//版权年份
    	return array.getStr("ipc","沪ICP备9999999号");
    }
    
    public static String getSettingValue(String Key) {
    	
    	Setting setting = new Setting("config"+File.separator+"ueditor.setting", true);
    	
    	return setting.getStr(Key);
    }
    
    public static int getSettingValueInt(String Key) {
    	
    	Setting setting = new Setting("config"+File.separator+"ueditor.setting", true);
    	
    	return setting.getInt(Key);
    }
    
}
