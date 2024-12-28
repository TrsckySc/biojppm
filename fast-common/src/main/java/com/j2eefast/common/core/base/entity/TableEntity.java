/*
 * All content copyright http://www.j2eefast.com, unless
 * otherwise indicated. All rights reserved.
 * No deletion without permission
 */
package com.j2eefast.common.core.base.entity;

import lombok.Data;

/**
 * 表组件前端Table渲染对象
 * @author huanzhou
 *
 */
@Data
public class TableEntity {

	/**
	 * 表格字段标签
	 */
	private String field;
	
	/**
	 * 列名称
	 */
	private String title;
	
	/**
	 * 是否对应字典信息
	 */
	private String dict;

	/**
	 * 查询字段是否为树查询
	 */
	private TableZtreeEntity ztree;

	/**
	 * 字段是否出现排序
	 */
	private boolean sortable;

	/**
	 * 是否查询
	 */
	private boolean query;

	/**
     * 是否为树
	 */
	private boolean filedQueryZtree;
	
}
