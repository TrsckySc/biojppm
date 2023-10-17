/**
 * Copyright (c) 2020-Now http://www.j2eefast.com All rights reserved.
 * No deletion without permission
 */
//package com.j2eefast.common.core.config;
//
//import java.io.FileNotFoundException;
//import java.lang.reflect.Field;
//import java.sql.SQLException;
//import java.util.HashMap;
//import java.util.Map;
//import java.util.concurrent.ConcurrentHashMap;
//
//import com.j2eefast.common.core.constants.ConfigConstant;
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
//import org.springframework.boot.context.properties.ConfigurationProperties;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.context.annotation.Primary;
//import com.alibaba.druid.pool.DruidDataSource;
//import com.j2eefast.common.core.config.properties.DruidProperties;
//import com.j2eefast.common.core.mutidatasource.DynamicDataSource;
//import com.j2eefast.common.core.utils.ToolUtil;
//import com.j2eefast.common.core.utils.YamlUtil;
//import cn.hutool.core.util.ReflectUtil;
//import cn.hutool.core.util.StrUtil;
//import org.springframework.stereotype.Service;
//
//
///**
// * 数据源自动配置
// * @author zhouzhou
// * @date 2020-03-12 10:10
// */
//@Slf4j
//@Configuration
//@ConditionalOnProperty(prefix = "spring.datasource.default", name = "url")
//public class MybatisDataSourceAutoConfiguration {
//
//	/**
//	 * 默认数据源
//	 */
//	private String 	  						 defaultdb 				   = "DEFAULT";
//	/**
//	 * 配置文件前缀
//	 */
//	private String 	 						 profilePrefix 			   = "application";
//	/**
//	 * 多数据源名称列表前缀
//	 */
//	private String 	  						 datasourceNamePrefix 	   = "spring.datasource.";
//
//
//	/**
//	 * 数据源名称
//	 */
//	@Value("${fast.db.datasourceNames:db1}")
//	private String	datasourceNames;
//
//	/**
//	 * 活动profiles
//	 */
//	@Value("${spring.profiles.active:Test}")
//	private String	active;
//
//
//	@Bean
//	@ConfigurationProperties(prefix = "spring.datasource.default")
//    public DruidProperties defaultProperties() {
//        return new DruidProperties();
//    }
//
//
//	@Bean
//    @ConditionalOnProperty(prefix = "fast.db", name = "muti-datasource-open", havingValue = "true")
//    public DruidProperties secondDataSource() {
//		DruidProperties temp = new DruidProperties();
//		String enabled = "enabled";
//		Map<?, ?> yamlMap = null;
//		String[] dbNames = null;
//        try{
//            yamlMap = YamlUtil.loadYaml(profilePrefix + "-" + active + ".yml");
//
//            dbNames = StrUtil.split(datasourceNames, ",");
//
//    		temp.setMap(new HashMap<Object, Object>(dbNames.length + 1));
//
//        }
//        catch (FileNotFoundException e){
//        	log.error("初始化多源数据库配置报错[1]:",e);
//        }
//
//
//		for(String dbName: dbNames) {
//			Boolean falg    = false;
//			DruidProperties druidProperties = new DruidProperties();
//			Field[] fileds = ReflectUtil.getFields(DruidProperties.class);
//			for(Field filed: fileds) {
//				String key = datasourceNamePrefix + dbName + StrUtil.DOT + filed.getName();
//				if(filed.getName().equals(enabled) && ToolUtil.isNotEmpty(YamlUtil.getProperty(yamlMap, key))
//						&& !(Boolean)YamlUtil.getProperty(yamlMap, key)) {
//					falg  = true;
//				}
//				if(ToolUtil.isNotEmpty(YamlUtil.getProperty(yamlMap, key))) {
//					ReflectUtil.setFieldValue(druidProperties, filed.getName(), YamlUtil.getProperty(yamlMap, key));
//				}
//			}
//			if(!falg) {
//				DruidDataSource dataSource = new DruidDataSource();
//				druidProperties.config(dataSource);
//				try {
//					dataSource.init();
//				} catch (SQLException e) {
//					log.error("初始化多源数据库配置报错[2]:",e);
//				}
//				temp.getMap().put(dbName, dataSource);
//			}
//		}
//        return temp;
//    }
//
//	@Bean
//	@Primary
//	public DynamicDataSource dataSource(DruidProperties defaultProperties,DruidProperties secondDataSource) {
//
//		Map<Object, Object> targetDataSources = null;
//
//		DruidDataSource defaultTargetDataSource = new DruidDataSource();
//
//		try {
//			defaultProperties.config(defaultTargetDataSource);
//			defaultTargetDataSource.init();
//		} catch (SQLException e) {
//			log.error("初始化多源数据库配置报错[3]:",e);
//		}
//
//		if(ToolUtil.isNotEmpty(secondDataSource.getMap())) {
//			targetDataSources = new ConcurrentHashMap<>(secondDataSource.getMap().size());
//			targetDataSources = secondDataSource.getMap();
//			targetDataSources.put(defaultdb, defaultTargetDataSource);
//		}else {
//			targetDataSources = new ConcurrentHashMap<>(2);
//			targetDataSources.put(defaultdb, defaultTargetDataSource);
//		}
//		for(Map.Entry<Object, Object> entry : targetDataSources.entrySet()){
//			ConfigConstant.DATA_SOURCES.put(entry.getKey(),entry.getValue());
//		}
//		return new DynamicDataSource(defaultTargetDataSource, targetDataSources);
//	}
//}
