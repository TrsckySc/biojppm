/*
 * All content copyright http://www.j2eefast.com, unless
 * otherwise indicated. All rights reserved.
 * No deletion without permission
 */
package com.j2eefast.framework.sys.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import java.io.Serializable;
import java.util.Date;

/**
 * sys_ureport_file
 * @author: ZhouZhou
 * @date 2021-08-14 19:57:51
 */
@Getter
@Setter
@TableName("sys_ureport_file")
public class SysUreportFileEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    /** 主键 */
    @TableId(value = "id",type = IdType.ASSIGN_ID)
    private Long id;

    /** 文件名 */
    private String name;

    /** 文件数据 */
    private byte[] content;

    /** 创建时间 */
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss" , timezone = "GMT+8")
    private Date createTime;


    /** 更新时间 */
    @TableField(value = "update_time", fill = FieldFill.UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss" , timezone = "GMT+8")
    private Date updateTime;
    
    /**
     * 下载时文件名称
     */
    private String fileName;

    /**
     * 访问权限
     */
    private String roleKeys;

    /**
     * 数据过滤表表别称
     */
    private String tableAlias;

    /**
     * 开放功能
     */
    private String func;

//    /**
//     * 是否分页
//     */
//    private String page;
//
//    /**
//     * 分页大小
//     */
//    private int pageSize;
//
//    /**
//     * 源对象多个,分割
//     */
//    private String objName;

    /**
     * 报表描述
     */
    private String remark;

    private String code;

    private String share;

    private String pass;

    private int time;
//
//    private Date time;
//    private String watermark;

}
