/*
 * All content copyright http://www.j2eefast.com, unless
 * otherwise indicated. All rights reserved.
 * No deletion without permission
 */
package com.j2eefast.framework.sys.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.j2eefast.common.core.base.entity.BaseEntity;
import lombok.Data;


/**
 * 字典数据表
 */
@TableName("sys_dict_data")
@Data
public class SysDictDataEntity extends BaseEntity {
	private static final long serialVersionUID = 1L;

	@TableId(type = IdType.ASSIGN_ID)
	private Long id;

	/** 字典排序 */
	private Long dictSort;

	/** 字典标签 */
	private String dictLabel;


	/** 字典键值 */
	private String dictValue;

	/** 字典类型 */
	private String dictType;

	/** 是否系统内置*/
	private String isSys;

	/** 样式属性（其他样式扩展） */
	private String cssClass;

	/** 删除标志*/
	@TableLogic
	@TableField(value = "del_flag", fill = FieldFill.INSERT)
	private String delFlag;

	/* css样式（如：color:red)*/
	private String cssStyle;

	/** 表格字典样式 */
	private String listClass;

	/** 是否默认（Y是 N否） */
	private String isDefault;

	/** 状态（0正常 1停用） */
	private String status;

}
