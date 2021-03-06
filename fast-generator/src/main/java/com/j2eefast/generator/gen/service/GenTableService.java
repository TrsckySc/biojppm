package com.j2eefast.generator.gen.service;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.io.IORuntimeException;
import cn.hutool.core.io.IoUtil;
import cn.hutool.core.util.CharsetUtil;
import cn.hutool.core.util.StrUtil;
import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.google.common.collect.Lists;
import com.j2eefast.common.core.base.entity.Ztree;
import com.j2eefast.common.core.exception.RxcException;
import com.j2eefast.common.core.mutidatasource.DataSourceContextHolder;
import com.j2eefast.common.core.mutidatasource.annotaion.mybatis.MybatisMapperRefresh;
import com.j2eefast.common.core.page.Query;
import com.j2eefast.common.core.utils.Md5Util;
import com.j2eefast.common.core.utils.PageUtil;
import com.j2eefast.common.core.utils.ToolUtil;
import com.j2eefast.common.db.context.DataSourceContext;
import com.j2eefast.common.db.context.SqlSessionFactoryContext;
import com.j2eefast.common.db.entity.SysDatabaseEntity;
import com.j2eefast.common.db.utils.SqlExe;
import com.j2eefast.framework.sys.mapper.SysDatabaseMapper;
import com.j2eefast.framework.sys.service.SysMenuService;
import com.j2eefast.framework.utils.Global;
import com.j2eefast.generator.gen.entity.GenEditCodeEntity;
import com.j2eefast.generator.gen.entity.GenTableColumnEntity;
import com.j2eefast.generator.gen.entity.GenTableEntity;
import com.j2eefast.generator.gen.mapper.GenTableMapper;
import com.j2eefast.generator.gen.util.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.Velocity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import javax.annotation.Resource;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * @time 2020/1/6 15:23
 * @version V1.0
 */
@Slf4j
@Service
public class GenTableService extends ServiceImpl<GenTableMapper,GenTableEntity> {


    @Autowired
    private GenTableColumnService genTableColumnService;

    @Lazy
    @Resource
    private GenEditCodeService genEditCodeService;

    @Lazy
    @Resource
    private GenTableService genTableService;

    @Resource
    private GenTableMapper genTableMapper;

    @Resource
    private SysMenuService sysMenuService;

	@Resource
	private SysDatabaseMapper sysDatabaseMapper;

    public PageUtil findPage(Map<String, Object> params) {
        String tableName = (String) params.get("tableName");
        String tableComment = (String) params.get("tableComment");
        Page<GenTableEntity> page = this.baseMapper.selectPage(new Query<GenTableEntity>(params).getPage(),
                new QueryWrapper<GenTableEntity>()
                        .like(StringUtils.isNotBlank(tableName), "table_name", tableName)
                        .like(StringUtils.isNotBlank(tableComment), "table_comment", tableComment)
        );
        return new PageUtil(page);
    }

    public PageUtil findChildPage(Map<String, Object> params) {

        String type = (String) params.get("type");
        if(ToolUtil.isNotEmpty(type) && type.equals("-1")){
            return null;
        }
        String searchTable = (String) params.get("searchTable");
        String pId = (String) params.get("pId");
        String name =(String) params.get("name");
        //???????????????
        String searchValue = (String) params.get("searchValue");

        //????????????
        if(searchTable.equals("gen_table")){
            Page<GenTableEntity> page = this.baseMapper.selectPage(new Query<GenTableEntity>(params).getPage(),
                    new QueryWrapper<GenTableEntity>().eq("tpl_category","child")
                            .eq(StringUtils.isNotBlank(searchValue), "id", searchValue)
                            .like(StringUtils.isNotBlank(name), "table_name", name));
            //????????????
            List<Ztree> list = new ArrayList<>();
            for(GenTableEntity tableEntity: page.getRecords()){
                Ztree ztree = new Ztree();
                ztree.setId(String.valueOf(tableEntity.getId()));
                ztree.setName(tableEntity.getTableName() + "("+tableEntity.getTableComment()+")");
                list.add(ztree);
            }
            //????????????????????????
            return new PageUtil(list,page.getTotal(),page.getSize(),page.getCurrent());
        }else{
            return this.genTableColumnService.findPage(params);
        }
    }


    public byte[] generatorCode(String[] tableNames) {

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ZipOutputStream zip = new ZipOutputStream(outputStream);
        for (String tableName : tableNames)
        {
            generatorCode(tableName, zip);
        }
        IoUtil.close(zip);
        return outputStream.toByteArray();
    }

    public byte[] generatorCode(String tableName){
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ZipOutputStream zip = new ZipOutputStream(outputStream);
        generatorCode(tableName, zip);
        IoUtil.close(zip);
        return outputStream.toByteArray();
    }

    /**
     * ??????????????????????????????
     */
    private void generatorCode(String tableName, ZipOutputStream zip){
        // ???????????????
        GenTableEntity table = findGenTableByName(tableName);
        // ???????????????
        List<GenTableColumnEntity> columns = table.getColumns();
        setPkColumn(table, columns);

        VelocityInitializer.initVelocity();

        VelocityContext context = VelocityUtils.prepareContext(table);

        // ?????????????????? ??????????????????
        List<String> templates = VelocityUtils.getTemplateList(table.getTplCategory(),table.getTarget());
        for (String template : templates){
            // ????????????
            StringWriter sw = new StringWriter();
            Template tpl = Velocity.getTemplate(template, CharsetUtil.UTF_8);
            tpl.merge(context, sw);
            try{
                // ?????????zip
                zip.putNextEntry(new ZipEntry(VelocityUtils.getFileName(template, table)));

                String temp = StrUtil.replace(sw.toString(),"<@>","#");
                temp =StrUtil.replace(temp,"<$>","$");
                IOUtils.write(temp, zip, CharsetUtil.UTF_8);
                IoUtil.close(sw);
                zip.closeEntry();
            } catch (IOException e){
                log.error("??????????????????????????????" + table.getTableName(), e);
            }
        }


    }


    /**
     * ????????????
     * @param tableId
     * @return
     */
    public boolean genCode(Long tableId) {
        // ???????????????
        GenTableEntity table = findGenTableById(tableId);
        String path = table.getRunPath().equals("/")? Global.getTempPath() + File.separator: table.getRunPath();
        // ???????????????
        List<GenTableColumnEntity> columns = table.getColumns();

        setPkColumn(table, columns);

        VelocityInitializer.initVelocity();

        VelocityContext context = VelocityUtils.prepareContext(table);
        // ??????????????????
        List<String> templates = VelocityUtils.getTemplateList(table.getTplCategory(),table.getTarget());
        if(table.getIsCover().equals("N")){
            for (String template : templates) {
                if(!template.contains("sql.vm")){
                    String p  = path + VelocityUtils.getFileName(template, table);
                    if(FileUtil.exist(p)){
                        throw  new RxcException(new File(p).getName() +"????????????","99992");
                    }
                }
            }
        }
        //??????ID
        Long menuId = (Long) context.get("menuId");
        @SuppressWarnings("unused")
		List<String> templaList = templates;
        //???????????????SQL
        String runMenuSqlPath = "";
        boolean isMenu = false;
        if(ToolUtil.isNotEmpty(table.getMenuName()) && ToolUtil.isNotEmpty(table.getParentName())){
            isMenu = true;
        }


        //1. ???????????????????????????
        genEditCodeService.remove(new QueryWrapper<GenEditCodeEntity>().eq("table_id",tableId));

        for (String template : templates) {
            // ????????????
            StringWriter sw = new StringWriter();
            Template tpl = Velocity.getTemplate(template, CharsetUtil.UTF_8);
            tpl.merge(context, sw);
            try {
                String p = path + VelocityUtils.getFileName(template, table);
                String temp =StrUtil.replace(sw.toString(),"<@>","#");
                temp =StrUtil.replace(temp,"<$>","$");
                File  file = FileUtil.writeString(temp,p,CharsetUtil.UTF_8);
                if(template.contains("sql.vm")){
                    runMenuSqlPath = p;
                }else{
                    //2.??????
                    GenEditCodeEntity genEditCode = new GenEditCodeEntity();
                    genEditCode.setTableId(tableId);
                    genEditCode.setMd5(Md5Util.hash(p));
                    genEditCode.setPath(FileUtil.normalize(p));
                    genEditCode.setTemplate(temp.getBytes());
                    genEditCode.setName(FileUtil.getName(file));
                    genEditCode.setSuffix(FileUtil.getSuffix(file));
                    genEditCodeService.save(genEditCode);
                }
            }
            catch (IORuntimeException e) {
                throw  new RxcException("??????????????????","99991");
            }
        }
        @SuppressWarnings("unused")
        GenTableEntity tableEntity = table;
        // ???????????????
        if(GenConstants.TPL_MASTER.equals(table.getTplCategory())){
            // ?????????
            String packageName = table.getPackageName(); //com.j2eefast.bcs.tbc
            // ?????????
            String moduleName = table.getModuleName(); //tbc
            // ????????????
            String businessName = table.getBusinessName();//log
            table = genTableService.findGenTableById(table.getChildId());
            table.setPackageName(packageName);
            table.setModuleName(moduleName);
            table.setBusinessName(businessName);
            // ???????????????
            columns = table.getColumns();
            setPkColumn(table, columns);

            Object o = context.get("fKey");
            Object packageName0 = context.get("packageName");
            context = VelocityUtils.prepareContext(table);
            context.put("fKey",o);
            context.put("packageName",packageName0);
            templates = VelocityUtils.getTemplateList(table.getTplCategory(),table.getTarget());
            for (String template : templates){
                if(!template.contains("sql.vm")){
                    // ????????????
                    StringWriter sw = new StringWriter();
                    Template tpl = Velocity.getTemplate(template, CharsetUtil.UTF_8);
                    tpl.merge(context, sw);
                    try {
                        String p = path + VelocityUtils.getFileName(template, table);
                        String temp =StrUtil.replace(sw.toString(),"<@>","#");
                        temp = StrUtil.replace(temp,"<$>","$");

                        //??????
                        File file = FileUtil.writeString(temp,p,CharsetUtil.UTF_8);

                        //2.??????
                        GenEditCodeEntity genEditCode = new GenEditCodeEntity();
                        genEditCode.setTableId(tableId);
                        genEditCode.setMd5(Md5Util.hash(p));
                        genEditCode.setPath(FileUtil.normalize(p));
                        genEditCode.setTemplate(temp.getBytes());
                        genEditCode.setName(FileUtil.getName(file));
                        genEditCode.setSuffix(FileUtil.getSuffix(file));
                        genEditCodeService.save(genEditCode);
                    }
                    catch (IORuntimeException e) {
                        throw  new RxcException("??????????????????","99991");
                    }
                }
            }
        }

        if(isMenu){
            //????????????????????????
            genTableService.updateGenTableMenuId(tableId,menuId);
            SqlExe.runFileSql(DataSourceContext.MASTER_DATASOURCE_NAME,FileUtil.file(runMenuSqlPath));
            sysMenuService.clearMenuRedis();
        }

        FileUtil.del(runMenuSqlPath);
        
        //???????????????????????????mapperXML
        Iterator<Map.Entry<Object, SqlSessionFactory>> entries = SqlSessionFactoryContext.getSqlSessionFactorys().entrySet().iterator();
        while (entries.hasNext()) {
            Map.Entry<Object, SqlSessionFactory> entry = entries.next();
           new MybatisMapperRefresh((String) entry.getKey(),entry.getValue()).loadRefresh();
        }

        return true;
    }

    /**
     * ?????????????????????
     *
     * @param table ???????????????
     * @param columns ??????????????????
     */
    public void setPkColumn(GenTableEntity table, List<GenTableColumnEntity> columns){
        for (GenTableColumnEntity column : columns) {
            if (column.isPk()){
                table.setPkColumn(column);
                break;
            }
        }
        if (ToolUtil.isEmpty(table.getPkColumn())) {
            table.setPkColumn(columns.get(0));
        }
    }

    /**
     * ???????????? ?????? ?????????????????????????????????
     * @param tableId
     * @return
     */
    @Deprecated
    public Map<String, String> previewCode(Long tableId) {

        Map<String, String> dataMap = new LinkedHashMap<>();
        // ???????????????
        // GenTableEntity table = this.genTableMapper.findGenTableById(tableId);

        GenTableEntity table = genTableService.findGenTableById(tableId);

        // ???????????????
        // table.setColumns(columns);
        List<GenTableColumnEntity> columns = table.getColumns();
        setPkColumn(table, columns);
        VelocityInitializer.initVelocity();

        VelocityContext context = VelocityUtils.prepareContext(table);

        // ??????????????????
        List<String> templates = VelocityUtils.getTemplateList(table.getTplCategory(),table.getTarget());
        for (String template : templates){
            // ????????????
            StringWriter sw = new StringWriter();
            Template tpl = Velocity.getTemplate(template, CharsetUtil.UTF_8);
            tpl.merge(context, sw);
            String temp =StrUtil.replace(sw.toString(),"<@>","#");
            temp =StrUtil.replace(temp,"<$>","$");
            dataMap.put(template, temp);
        }

        if(GenConstants.TPL_MASTER.equals(table.getTplCategory())){
            table = genTableService.findGenTableById(table.getChildId());
            Object o = context.get("fKey");
            Object packageName = context.get("packageName");
            // ???????????????
            columns = table.getColumns();
            setPkColumn(table, columns);
            context = VelocityUtils.prepareContext(table);
            context.put("fKey",o);
            context.put("packageName",packageName);
            templates = VelocityUtils.getTemplateList(table.getTplCategory(),table.getTarget());
            for (String template : templates){
                // ????????????
                StringWriter sw = new StringWriter();
                Template tpl = Velocity.getTemplate(template, CharsetUtil.UTF_8);
                tpl.merge(context, sw);
                String temp =StrUtil.replace(sw.toString(),"<@>","#");
                temp =StrUtil.replace(temp,"<$>","$");
                //vm/java/mapper.java.vm
                String templ = StrUtil.subAfter(template,"/",true);
                templ = StrUtil.subBefore(template,"/",true) + "/child" + StrUtil.upperFirst(templ);
                dataMap.put(templ, temp);
            }
        }

        return dataMap;
    }


    /**
    * @Title: findGenTableById 
    * @Description: ????????????????????? columns
    * @param id
    * @return  GenTableEntity 
    * @author mfksn001@163.com
    * @Date: 2020???6???2???
     */
    public GenTableEntity findGenTableById(Long id) {
    	GenTableEntity table = genTableMapper.findByTableId(id);
    	if (StringUtils.isNotBlank(table.getOptions())) {
    	    try {
				table.setOption(JSONObject.parseObject(table.getOptions(), Option.class));
			} catch (Exception e) {
				 throw new RxcException("???????????????????????????"); 
			}
    	}
    	table.setColumns(genTableColumnService.findListByTableId(id));
        return table;
    }

    public GenTableEntity findByTableId(Long id){
        return genTableMapper.findByTableId(id);
    }
    
    public GenTableEntity findGenTableByName(String tableName) {
    	GenTableEntity table = genTableMapper.findByName(tableName);
    	if (StringUtils.isNotBlank(table.getOptions())) {
    	    try {
				table.setOption(JSONObject.parseObject(table.getOptions(), Option.class));
			} catch (Exception e) {
				 throw new RxcException("???????????????????????????"); 
			}
    	}
    	table.setColumns(genTableColumnService.findListByTableId(table.getId()));
        return table;
    }

    public GenTableEntity findGenTableMenuById(Long id) {
        return this.genTableMapper.findGenTableMenuById(id);
    }

    public void validateEdit(GenTableEntity genTable) {
        if (genTable.isTree()) {
        	if(null == genTable.getOption()) {
        		throw new RxcException("?????????????????????????????????");
        	}       	
            if (StringUtils.isEmpty(genTable.getOption().getTreeCode())) {
                throw new RxcException("???????????????????????????");
            }
            else if (StringUtils.isEmpty(genTable.getOption().getTreeParentCode())) {
                throw new RxcException("??????????????????????????????");
            }
            else if (StringUtils.isEmpty(genTable.getOption().getTreeName())) {
                throw new RxcException("???????????????????????????");
            }
        }

        if(!genTable.isChild()){
            if (StringUtils.isEmpty(genTable.getPackageName())) {
                throw new RxcException("???????????????????????????");
            }
            if (StringUtils.isEmpty(genTable.getModuleName())) {
                throw new RxcException("???????????????????????????");
            }
            else if (StringUtils.isEmpty(genTable.getBusinessName())) {
                throw new RxcException("???????????????????????????");
            }
            else if (StringUtils.isEmpty(genTable.getFunctionName())) {
                throw new RxcException("???????????????????????????");
            }
            else if (StringUtils.isEmpty(genTable.getFunctionAuthor())) {
                throw new RxcException("??????????????????");
            }

        }
        if(genTable.isMaster()){
            if (ToolUtil.isEmpty(genTable.getChildId())) {
                throw new RxcException("??????????????????");
            }
            if (ToolUtil.isEmpty(genTable.getChildFieldId())) {
                throw new RxcException("????????????????????????");
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean update(GenTableEntity genTable) {
    	//??????????????????
    	if (null != genTable.getOption()) { 
    		genTable.setOptions(JSONObject.toJSONString(genTable.getOption()));
    	}
        int row = this.genTableMapper.updateGenTable(genTable);
        if (row > 0) {
            for (GenTableColumnEntity cenTableColumn : genTable.getColumns()) {
                cenTableColumn.setIsRequired(StrUtil.emptyToDefault(cenTableColumn.getIsRequired(),"0"));
                cenTableColumn.setIsEdit(StrUtil.emptyToDefault(cenTableColumn.getIsEdit(),"0"));
                cenTableColumn.setIsQuery(StrUtil.emptyToDefault(cenTableColumn.getIsQuery(),"0"));
                cenTableColumn.setIsList(StrUtil.emptyToDefault(cenTableColumn.getIsList(),"0"));
                cenTableColumn.setIsTableSort(StrUtil.emptyToDefault(cenTableColumn.getIsTableSort(),"0"));
                cenTableColumn.setDictType(StrUtil.emptyToDefault(cenTableColumn.getDictType(),""));
                cenTableColumn.setEditInfo(StrUtil.emptyToDefault(cenTableColumn.getEditInfo(),""));
                genTableColumnService.updateGenTableColumn(cenTableColumn);
            }
            return  true;
        }
        return false;
    }

    @Transactional
    public void importGenTable(List<GenTableEntity> tableList, String operName, String dbName) {
        for (GenTableEntity table : tableList) {
            try {

                String tableName = table.getTableName();
                GenUtils.initTable(table, operName);
                table.setDbName(dbName);
                boolean row = this.save(table);
                if (row) {
                     // ???????????????
                	 List<GenTableColumnEntity> genTableColumns = genTableColumnService.generateDbTableColumnsByName(dbName,tableName);
                     for (GenTableColumnEntity column : genTableColumns) {
                        GenUtils.initColumnField(column, table);
                        //??????comment?????? ??????comment ???JavaField
                        if (StringUtils.isBlank(column.getColumnComment())){ 
                        	column.setColumnComment(column.getJavaField());
                        }
                        genTableColumnService.save(column);
                    }
                }
            }
            catch (Exception e) {
                log.error("?????? " + table.getTableName() + " ???????????????", e);
            }
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean deleteGenTableByIds(Long[] ids) {
       return this.genTableMapper.deleteGenTableByIds(ids)> 0 &&
               genTableColumnService.deleteGenTableColumnByIds(ids) >0;
    }



    
    /**
    * @Title: generateDbTableList 
    * @Description: ?????????????????????????????? ?????????List
    * @param db
    * @param dbTableName
    * @return  List<GenTableEntity>
    * @author mfksn001@163.com
    * @Date: 2020???5???30???
     */
	public List<GenTableEntity> generateDbTableList(SysDatabaseEntity db, String dbTableName, String dbTableComment) {

		List<GenTableEntity> list = Lists.newArrayList();
		String dbType = db.getDbType();
        List<GenTableEntity> notList = this.list(new QueryWrapper<GenTableEntity>().eq("db_name",db.getDbName()));
        List<String> names = null;
        if(ToolUtil.isNotEmpty(notList)){
            names =  notList.stream().map(GenTableEntity :: getTableName).collect(Collectors.toList());
        }
		DataSourceContextHolder.setDataSourceType(db.getDbName());
		try {
			list = genTableMapper.generateTableList(dbType, db.getSchema(), dbTableName, dbTableComment,names);
		} catch (Exception e) {
			e.printStackTrace();
		} finally {
			DataSourceContextHolder.clearDataSourceType();
		}
		return list;

	}
	
    public List<GenTableEntity>  generateDbTableList(SysDatabaseEntity db) {
		
		List<GenTableEntity> list = Lists.newArrayList();
		String dbType = db.getDbType();
        List<GenTableEntity> notList = this.list(new QueryWrapper<GenTableEntity>().eq("db_name",db.getDbName()));
        List<String> names = null;
        if(ToolUtil.isNotEmpty(notList)){
            names =  notList.stream().map(GenTableEntity :: getTableName).collect(Collectors.toList());
        }
		if (!DataSourceContext.MASTER_DATASOURCE_NAME.equals(db.getDbName())) {
			DataSourceContextHolder.setDataSourceType(db.getDbName());
			list = genTableMapper.generateTableList(dbType, db.getSchema(),null, null,names);
			DataSourceContextHolder.clearDataSourceType();
		} else {
			list = genTableMapper.generateTableList(dbType, db.getSchema(), null, null,names);
		}

		return list;

	}	
    
    
    /**
    * @Title: generateTablePage 
    * @Description: ?????????????????????????????????????????????????????????,
    * @param params
    * @return  PageUtil 
    * @author mfksn001@163.com
    * @Date: 2020???6???1???
     */
	public PageUtil generateDbTablePage(Map<String, Object> params) {
		String tableName = (String) params.get("tableName");
		String tableComment = (String) params.get("tableComment");
		String dbName = (String) params.get("dbName");
		Page<GenTableEntity> page = new Query<GenTableEntity>(params).getPage();
		List<GenTableEntity> list = Lists.newArrayList();
		try {
			SysDatabaseEntity db = sysDatabaseMapper.getByName(dbName);
			String dbType = db.getDbType();
			String schema = db.getSchema();
			List<GenTableEntity> notList = this.list(new QueryWrapper<GenTableEntity>().eq("db_name",dbName));
            List<String> names = null;
            if(ToolUtil.isNotEmpty(notList)){
                names =  notList.stream().map(GenTableEntity :: getTableName).collect(Collectors.toList());
            }
            //postgresql ???????????????????????????????????????????????????
            if(dbType.equals("postgresql")){
                page.setOrders(null);
            }
			if (!DataSourceContext.MASTER_DATASOURCE_NAME.equals(dbName)) {
				DataSourceContextHolder.setDataSourceType(db.getDbName());  //???????????????
				list = genTableMapper.generateTablePage(page, dbType, schema, tableName, tableComment,names);
                DataSourceContextHolder.clearDataSourceType();
			} else {
				list = genTableMapper.generateTablePage(page, dbType, schema, tableName, tableComment,names);
			}
			page.setRecords(list);
		} catch (Exception e) {
			e.printStackTrace();
		} 
		return new PageUtil(page);
	}
  
    
    /**
    * @Title: generateDbTableListByNames 
    * @Description: ??????????????????????????????????????????
    * @param db
    * @param tableNames
    * @return  List<GenTableEntity> 
    * @author mfksn001@163.com
    * @Date: 2020???6???1???
     */
    public List<GenTableEntity> generateDbTableListByNames(SysDatabaseEntity db ,String[] tableNames) {
       	List<GenTableEntity> list  = Lists.newArrayList();
       	DataSourceContextHolder.setDataSourceType(db.getDbName());
		try {
			  list = genTableMapper.generateTableListByNames(db.getDbType(),db.getSchema() , tableNames);
		} catch (Exception e) {
			e.printStackTrace();
		}finally {
			  DataSourceContextHolder.clearDataSourceType();
		}
        return list;
    }

    /**
     * ????????????Id
     * @param id
     * @param menuId
     */
    public void updateGenTableMenuId(Long id, Long menuId){
        this.genTableMapper.updateGenTableMenuId(id,menuId);
    }
}
