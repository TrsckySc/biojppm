/*
 * All content copyright http://www.j2eefast.com, unless
 * otherwise indicated. All rights reserved.
 * No deletion without permission
 */
package com.j2eefast.common.core.utils;
import java.io.Serializable;
import java.util.List;

import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import lombok.Data;

/**
 * 分页工具
 * @author zhouzhou
 * @date 2017-03-12 16:59
 */
@Data
public class PageUtil implements Serializable {
	
	private static final long 					serialVersionUID 					= 1L;
	/**
	 * 总记录数
	 */
	private long 								totalCount;
	/**
	 * 每页记录数
	 */
	private long 								pageSize;
	/**
	 * 总页数
	 */
	private long 								totalPage;
	
	/**
	 * 当前页数
	 */
	private long 								currPage;
	
	/**
	 * 数据列表
	 */
	private List<?> 							list;

	/**
	 * 备注数据(可以为表格添数据)
	 */
	private Object 								__JSON__;

	/**
	 * 分页
	 * @param list 列表数据
	 * @param totalCount 总记录数
	 * @param pageSize 每页记录数
	 * @param currPage 当前页数
	 */
	public PageUtil(List<?> list, long totalCount, long pageSize, long currPage) {
		this.list = list;
		this.totalCount = totalCount;
		this.pageSize = pageSize;
		this.currPage = currPage;
		this.totalPage = (long) Math.ceil((double) totalCount / pageSize);
	}

	/**
	 * 分页
	 */
	public PageUtil(Page<?> page) {
		this.list = page.getRecords();
		this.totalCount = page.getTotal();
		this.pageSize = page.getSize();
		this.currPage = page.getCurrent();
		this.totalPage = page.getPages();
	}

	/**
	 * 分页与添加表格附加数据,主要为统计合计数据
	 * @param page
	 * @param __JSON__
	 */
	public PageUtil(Page<?> page,Object __JSON__) {
		this.list = page.getRecords();
		this.totalCount = page.getTotal();
		this.pageSize = page.getSize();
		this.currPage = page.getCurrent();
		this.totalPage = page.getPages();
		this.__JSON__ = JSONUtil.parseObj(__JSON__);
	}
}
