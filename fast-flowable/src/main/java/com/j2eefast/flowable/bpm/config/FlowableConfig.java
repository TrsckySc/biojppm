/**
 * Copyright (c) 2020-Now http://www.j2eefast.com All rights reserved.
 * No deletion without permission
 */
package com.j2eefast.flowable.bpm.config;

import org.activiti.compatibility.spring.SpringFlowable5CompatibilityHandlerFactory;
import org.flowable.common.engine.api.async.AsyncTaskExecutor;
import org.flowable.common.engine.impl.EngineDeployer;
import org.flowable.engine.impl.rules.RulesDeployer;
import org.flowable.spring.SpringProcessEngineConfiguration;
import org.flowable.spring.boot.EngineConfigurationConfigurer;
import org.flowable.spring.job.service.SpringAsyncExecutor;
import org.flowable.ui.common.tenant.DefaultTenantProvider;
import org.flowable.ui.modeler.repository.ModelRepositoryImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.*;
import org.springframework.core.task.SimpleAsyncTaskExecutor;
import org.springframework.core.task.TaskExecutor;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import java.util.ArrayList;

/**
 * <p></p>
 *
 * @author: zhouzhou
 * @date: 2020-04-16 14:23
 * @web: http://www.j2eefast.com
 * @version: 1.0.1
 */
@Configuration
@DependsOn("transactionManager")
@ComponentScan(basePackages ={
        "org.flowable.ui.modeler",
		"org.flowable.ui.modeler.repository",
		"org.flowable.ui.modeler.service",
		"org.flowable.ui.common.tenant",
		"org.flowable.ui.common.repository"
		,"org.flowable.ui.task.service.debugger"
},excludeFilters=@ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE,value = {DefaultTenantProvider.class}))
public class FlowableConfig{

	@Bean(name = "processEngineConfiguration")
	public SpringProcessEngineConfiguration getSpringProcessEngineConfiguration(@Qualifier("flowableSourcePrimary") DataSource dataSource
			,@Qualifier("transactionManager") PlatformTransactionManager transactionManager
	) {
		SpringProcessEngineConfiguration configuration = new SpringProcessEngineConfiguration();
		configuration.setDataSource(dataSource);
		configuration.setTransactionManager(transactionManager);
		configuration.setDatabaseSchemaUpdate("true");
		//设置自定义的uuid生成策略
		configuration.setIdGenerator(uuidGenerator());
		configuration.setAsyncExecutorActivate(false);
		//启用任务关系计数
		configuration.setEnableTaskRelationshipCounts(true);
		//启动同步功能 一定要启动否则报错
		//configuration.setAsyncExecutor(springAsyncExecutor());

		configuration.setCustomPostDeployers(new ArrayList<EngineDeployer>(){
			private static final long serialVersionUID = 4041439225480991716L;
			{
				add(new RulesDeployer());
			}
		});
		return configuration;
	}

//	@Bean
//	public SpringAsyncExecutor springAsyncExecutor() {
//		SpringAsyncExecutor springAsyncExecutor = new SpringAsyncExecutor();
//		springAsyncExecutor.setTaskExecutor((AsyncTaskExecutor) processTaskExecutor());
//		springAsyncExecutor.setDefaultAsyncJobAcquireWaitTimeInMillis(1000);
//		springAsyncExecutor.setDefaultTimerJobAcquireWaitTimeInMillis(1000);
//		return springAsyncExecutor;
//	}

	/**
	 * 兼容V5
	 * @return
	 */
	@Bean
	public SpringFlowable5CompatibilityHandlerFactory createSpringFlowable5CompatibilityHandlerFactory() {
		return new SpringFlowable5CompatibilityHandlerFactory();
	}

	@Bean
	public TaskExecutor processTaskExecutor() {
		return new SimpleAsyncTaskExecutor();
	}

	@Bean
	public UuidGenerator uuidGenerator() {
		return new UuidGenerator();
	}
}
