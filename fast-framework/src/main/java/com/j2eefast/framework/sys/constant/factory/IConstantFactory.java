/*
 * All content copyright http://www.j2eefast.com, unless
 * otherwise indicated. All rights reserved.
 * No deletion without permission
 */
package com.j2eefast.framework.sys.constant.factory;

/**
 * <p>常量产生接口</p>
 *
 * @author: zhouzhou
 * @date: 2019-04-07 10:03
 * @web: http://www.j2eefast.com
 * @version: 1.0.1
 */

import com.j2eefast.common.core.base.entity.LoginUserEntity;
import com.j2eefast.framework.log.entity.SysLoginInfoEntity;
import com.j2eefast.framework.sys.entity.SysMenuEntity;
import com.j2eefast.framework.sys.entity.SysModuleEntity;
import com.j2eefast.framework.sys.entity.SysRoleEntity;
import com.j2eefast.framework.sys.service.SysFileService;
import com.j2eefast.framework.sys.service.SysFileUploadService;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * <p>常量生产接口</p>
 *
 * @author: zhouzhou
 * @date: 2019-04-02 11:01
 * @web: http://www.j2eefast.com
 * @version: 1.0.1
 */
public interface IConstantFactory {

	/**
	 * 根据用户id获取用户名称
	 */
	String getUserNameById(Long userId);

	/**
	 * 根据用户id获取用户账号
	 *
	 * @author stylefeng
	 * @date 2017年5月16日21:55:371
	 */
	String getUserUserNameById(Long userId);

	/**
	 * 通过角色ids获取角色名称
	 */
	String getRoleName(Long userId);

	/**
	 * 通过用户ID获取角色ids
	 * @param userId
	 * @return
	 */
	List<Long> getRoleIds(Long userId);


	/**
	 * 通过用户ID获取角色ids
	 * @param userId
	 * @return
	 */
	List<SysRoleEntity> getRoles(Long userId);

	/**
	 * 通过用户ID获取模块
	 * @param userId
	 * @return
	 */
	List<Map<String, Object>> getModules(Long userId);

//	/**
//	 * 通过角色id获取角色名称
//	 */
//	String getSingleRoleName(Long roleId);
//
//	/**
//	 * 通过角色id获取角色英文名称
//	 */
//	String getSingleRoleKey(Long roleId);

	/**
	 * 通过角色ID获取角色对象
	 */
	SysRoleEntity getRoleById(Long roleId);


	Set<String> findPermissionsByUserId(Long userId);

	/**
	 * 通过用户ID获取对应部门名称
	 */
	String getDeptName(Long userId);


	/**
	 * 获取用户登录状态
	 */
	String getStatusName(String status);

	/**
	 * 获取菜单状态
	 */
	String getMenuStatusName(String status);

	/**
	 * 通过用户ID 菜单编码 获取菜单
	 * @param userId
	 * @param moduleCode
	 * @return
	 */
	List<SysMenuEntity> getMenuByUserIdModuleCode(Long userId, String moduleCode, LoginUserEntity user);


	/**
	 * 获取被缓存的对象(用户删除业务)
	 */
	String getCacheObject(String para);

	/**
	 * 获取子部门id
	 */
	List<Long> getSubDeptId(Long deptId);

	/**
	 * 获取所有父部门id
	 */
	List<Long> getParentDeptIds(Long deptId);

	/**
	 * 获取用户的职位名称
	 */
	String getPositionName(Long userId);

	/**
	 * 获取用户的职位ids
	 */
	String getPositionIds(Long userId);


	/**
	 * 获取公司名称
	 */
	String getCompName(Long userId);

	/**
	 * 清理菜单缓存
	 */
	void clearMenu();

	void clearMenu(Long userId);

	/**
	 * 清理权限缓存
	 */
	void clearRole();

	
	void clearRole(Long userId);

	
	void clearCompName(Long userId);

	
	void clearDeptName(Long userId);
	
	/**
	 * 清理模块缓存
	 */
	void clearModules();

	void clearModules(Long userId);

	/**
	 * 清除用户信息
	 * @param userId
	 */
	void clearUser(Long userId);


	SysLoginInfoEntity getFirstLoginInfo(String username);

	SysFileUploadService getSysFileUploadService();

	SysFileService getSysFileService();
}
