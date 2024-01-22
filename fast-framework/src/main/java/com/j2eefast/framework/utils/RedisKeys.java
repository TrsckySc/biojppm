/*
 * All content copyright http://www.j2eefast.com, unless
 * otherwise indicated. All rights reserved.
 * No deletion without permission
 */
package com.j2eefast.framework.utils;

/**
 * Redis所有Keys
 */
public class RedisKeys {

	public static String getSysConfigKey(String key) {
		return "sys:config:" + key;
	}

	public static String getMonitorKey(String key) {
		return "stk:monitor:" + key;
	}

	public static String getShiroSessionKey(String key) {
		return "sessionid:" + key;
	}
	
	public static String getUserLoginKey(String key) {
		return "sys:userlogin:" + key;
	}

	public static String getDictConfigKey(String key) {
		return "sys:dict:" + key;
	}

	public static String getNoticeKey(){
		return "sys:notice";
	}

}
