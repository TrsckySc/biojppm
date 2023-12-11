/*
 * All content copyright http://www.j2eefast.com, unless 
 * otherwise indicated. All rights reserved.
 * No deletion without permission
 */
package com.j2eefast.common.core.enums;

/**
 * 业务操作类型 
 * @author zhouzhou
 * @date 2020-03-12 14:12
 */
public enum BusinessType {
	/**
     * 其它
     */
    OTHER,

    /**
     * 新增
     */
    INSERT,

    /**
     * 修改
     */
    UPDATE,

    /**
     * 删除
     */
    DELETE,

    /**
     * 授权
     */
    GRANT,

    /**
     * 导出
     */
    EXPORT,

    /**
     * 导入
     */
    IMPORT,

    /**
     * 强退
     */
    FORCE,

    /**
     * 生成代码
     */
    GENCODE,

    /**
     * 清空
     */
    CLEAN,

    /**
     * 执行
     */
    RUN,

    /**
     * 审批
     */
    APPROVAL,
    /**
     * 撤回
     */
    REVOKE,
}
