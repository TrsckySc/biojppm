/*
 * All content copyright http://www.j2eefast.com, unless 
 * otherwise indicated. All rights reserved.
 * No deletion without permission
 */
package com.j2eefast.framework.config;

import cn.hutool.core.comparator.ComparableComparator;
import cn.hutool.core.date.DateUtil;
import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.setting.Setting;
import com.bstek.ureport.console.ServletAction;
import com.bstek.ureport.definition.datasource.BuildinDatasource;
import com.j2eefast.common.core.constants.ConfigConstant;
import com.j2eefast.common.core.io.PropertiesUtils;
import com.j2eefast.common.core.utils.RedisUtil;
import com.j2eefast.common.core.utils.SpringUtil;
import com.j2eefast.common.core.utils.ToolUtil;
import com.j2eefast.common.db.context.DataSourceContext;
import com.j2eefast.common.db.utils.SqlExe;
import com.j2eefast.framework.quartz.entity.SysJobEntity;
import com.j2eefast.framework.quartz.service.SysJobService;
import com.j2eefast.framework.quartz.utils.ScheduleUtils;
import com.j2eefast.framework.sys.entity.SysModuleEntity;
import com.j2eefast.framework.sys.service.SysModuleService;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Scheduler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.io.File;
import java.util.List;
import java.util.Map;

/**
 *
 * @ClassName: BaseInitialze
 * @Package: com.j2eefast.framework.config
 * @author: zhouzhou Emall:loveingowp@163.com
 * @time 2020/2/14 18:32
 * @version V1.0
 */
@Slf4j
@Component
public class BaseInitialze  implements ApplicationRunner {

    @Autowired
    private SysModuleService sysModuleService;
	@Qualifier("schedulerFactoryBean")
	@Autowired
	private Scheduler scheduler;
    @Autowired
    private SysJobService sysJobService;
    @Autowired
    private RedisUtil redisUtil;

    /**
     * ??????????????????????????????
     */
    @Value("#{ @environment['fast.updateDb.auto'] ?: false }")
    private boolean auto;

    @Value("#{ @environment['fast.ureport.enabled'] ?: false }")
    private boolean enabled;

    @SuppressWarnings({ "unchecked"})
	@Override
    public void run(ApplicationArguments args) throws Exception {


    	/**
    	 * ?????????????????????
    	 */
        List<SysModuleEntity> list = sysModuleService.list();
        for(SysModuleEntity entity: list){
            boolean flag = true;
            try {
                Class.forName(entity.getMainClassName());
            }catch (ClassNotFoundException e){
                flag = false;
            }
            if(!flag){
                if(!entity.getStatus().equals("2")){
                	entity.setStatus("2");
                	sysModuleService.setRoles(entity.getId(), entity.getStatus());
                }
            }else{
                // ???????????????????????????????????????
                if(auto){
                    //??????????????????
                    String path = "classpath:config"+File.separator+"update"+File.separator+"db" + File.separator +
                    		entity.getModuleCode() + File.separator + "version.setting";
                    if(FileUtil.exist(path)){
                        Setting setting = new Setting(path);
                        if(!setting.isEmpty("dbType") && !setting.isEmpty("version")){
                            //???????????????
                            String dbType = setting.get("dbType","dbName");
                            if(ToolUtil.isNotEmpty(dbType)){
                                //???????????????
                                String dbV = entity.getCurrentVersion();
                                //???????????????????????????????????????
                                String defaultDbType = DataSourceContext.getDbType(dbType);
                                String update_info = "";
                                for(int i=1;;i++){
                                    if(setting.containsKey("version","v"+i)){
                                        String tempVersion = setting.get("version","v"+i);
                                        if(ToolUtil.isNotEmpty(tempVersion)){
                                            if(ComparableComparator.INSTANCE.compare(dbV,tempVersion) < 0){
                                                //?????????????????? ?????????????????????????????????????????????
                                                path = "classpath:config"+File.separator+"update"+File.separator+"db"+ File.separator + entity.getModuleCode() +
                                                        File.separator + defaultDbType + File.separator  + defaultDbType+"_" +tempVersion + ".sql";
                                                if(FileUtil.exist(path)){
                                                    //
                                                    log.info("------------------------------------////---<"+entity.getModuleName()+ ">?????? -->[??????:"+dbV+" ??????-->"+tempVersion+"]///------------------------------------");
                                                    SqlExe.runFileSql(dbType,FileUtil.file(path));
                                                    update_info = "????????????:" + DateUtil.now() + " ??????:"+entity.getCurrentVersion() +" --> " +tempVersion;
                                                    dbV = tempVersion;
                                                }
                                            }
                                        }
                                    }else{
                                        break;
                                    }
                                }

                                if(ToolUtil.isNotEmpty(update_info) && !entity.getCurrentVersion().equals(dbV)){
                                    sysModuleService.setVersion(entity.getId(),dbV,update_info);
                                }
                            }
                        }
                    }
                }

                if(!entity.getStatus().equals("0")){
                	entity.setStatus("0");
                    sysModuleService.setRoles(entity.getId(), entity.getStatus());
                }
            }
        }

        //??????
		scheduler.clear();

        //?????????????????????
        redisUtil.set(ConfigConstant.CONFIG_KEY, PropertiesUtils.getInstance().getProperty(ConfigConstant.SYS_VERSION,"1.0.1"),RedisUtil.NOT_EXPIRE);

        /**
         * ??????????????????
         */
        List<SysJobEntity> sysJobList =  sysJobService.list();
        if(ToolUtil.isNotEmpty(sysJobList)) {
        	for(SysJobEntity sysJob: sysJobList) {
    			ScheduleUtils.createScheduleJob(scheduler, sysJob);
        	}
        }

        /**
         * ??????????????????ureport2 ??????
         */
        if(enabled){
            //??????????????????
            SpringUtil.unregisterBean("ureport.exportExcelServletAction");
            SpringUtil.unregisterBean("ureport.datasourceServletAction");
            SpringUtil.unregisterBean("ureport.htmlPreviewServletAction");
            SpringUtil.unregisterBean("ureport.designerServletAction");
        }
    }
}
