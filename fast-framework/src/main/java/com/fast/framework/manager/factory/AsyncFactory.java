package com.fast.framework.manager.factory;

import java.util.TimerTask;

import com.fast.framework.log.entity.SysLoginInfoEntity;
import com.fast.framework.log.service.SysLoginInfoSerice;
import com.fast.framework.sys.entity.SysLogEntity;
import com.fast.framework.sys.service.SysLogService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.fast.common.core.utils.AddressUtil;
import com.fast.common.core.utils.ServletUtil;
import com.fast.common.core.utils.SpringUtil;
import com.fast.framework.utils.ShiroUtils;
import cn.hutool.core.date.DateUtil;
import cn.hutool.http.useragent.UserAgent;
import cn.hutool.http.useragent.UserAgentUtil;

/**
 * 异步工厂
 * @author zhouzhou
 * @date 2017-03-12 16:40
 */
public class AsyncFactory {
	
	 private static final Logger 					LOG 					= LoggerFactory.getLogger(AsyncFactory.class);


	/**
	 * 操作日志记录
	 *
	 * @param operLog 操作日志信息
	 * @return 任务task
	 */
	public static TimerTask recordOper(final SysLogEntity operLog){
		
		return new TimerTask(){
			@Override
			public void run(){
				// 远程查询操作地点
				operLog.setOperLocation(AddressUtil.getRealAddressByIp(operLog.getOperIp()));
				SpringUtil.getBean(SysLogService.class).save(operLog);
			}
		};
	}
	 
	 /**
	     * 记录登陆信息
	     * 
	     * @param username 用户名
	     * @param status 状态
	     * @param message 消息
	     * @param args 列表
	     * @return 任务task
	     */
	    public static TimerTask recordLogininfor(final String username,final Long compId, final String status, final String message, final Object... args){
	        final UserAgent userAgent =   UserAgentUtil.parse(ServletUtil.getRequest().getHeader("User-Agent"));
	        final String ip = ShiroUtils.getIp();
	        return new TimerTask(){
	            @Override
	            public void run(){
	                // 获取客户端操作系统
	                String os = userAgent.getOs().toString();
	                // 获取客户端浏览器
	                String browser = userAgent.getBrowser().toString();
	                // 封装对象
	                SysLoginInfoEntity logininfor = new SysLoginInfoEntity();
	                logininfor.setUsername(username);
	                logininfor.setIpaddr(ip);
	                logininfor.setLoginLocation(AddressUtil.getRealAddressByIp(ip));
	                logininfor.setBrowser(browser);
	                logininfor.setOs(os);
					logininfor.setCompId(compId);
	                logininfor.setMsg(message);
	                
	                if(userAgent.isMobile()) {
	                	logininfor.setMobile("0");
	                }else {
	                	logininfor.setMobile("1");
	                }
	                // 日志状态
	                logininfor.setStatus(status);
	                logininfor.setLoginTime(DateUtil.date());
	                // 插入数据
	                SpringUtil.getBean(SysLoginInfoSerice.class).save(logininfor);
	                LOG.info("记录登陆信息!");
	            }
	        };
	    }
}
