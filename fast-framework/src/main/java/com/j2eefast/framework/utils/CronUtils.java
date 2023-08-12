package com.j2eefast.framework.utils;

import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import cn.hutool.core.date.DateUtil;
import org.quartz.CronExpression;
import org.quartz.TriggerUtils;
import org.quartz.impl.triggers.CronTriggerImpl;

/**
 * @Description: cron表达式工具类
 * @author: zhouzhou Emall:loveingowp@163.com
 * @time 2020/1/19 13:33
 * @version V1.0
 
 *
 */
public class CronUtils {
    /**
     * 返回一个布尔值代表一个给定的Cron表达式的有效性
     *
     * @param cronExpression Cron表达式
     * @return boolean 表达式是否有效
     */
    public static boolean isValid(String cronExpression)
    {
        return CronExpression.isValidExpression(cronExpression);
    }

    /**
     * 返回一个字符串值,表示该消息无效Cron表达式给出有效性
     *
     * @param cronExpression Cron表达式
     * @return String 无效时返回表达式错误描述,如果有效返回null
     */
    public static String getInvalidMessage(String cronExpression)
    {
        try
        {
            new CronExpression(cronExpression);
            return null;
        }
        catch (ParseException pe)
        {
            return pe.getMessage();
        }
    }

    /**
     * 返回下一个执行时间根据给定的Cron表达式
     *
     * @param cronExpression Cron表达式
     * @return Date 下次Cron表达式执行时间
     */
    public static Date getNextExecution(String cronExpression){
        try
        {
            CronExpression cron = new CronExpression(cronExpression);
            return cron.getNextValidTimeAfter(new Date(System.currentTimeMillis()));
        }
        catch (ParseException e)
        {
            throw new IllegalArgumentException(e.getMessage());
        }
    }

    /**
     * 通过表达式获取近10次的执行时间
     * @param cron
     * @return
     */
    public static List<String> getRecentTriggerTime(String cron) {
         List<String> list = new ArrayList<String>();
         try {
             CronTriggerImpl cronTriggerImpl = new CronTriggerImpl();
             cronTriggerImpl.setCronExpression(cron);
             // 这个是重点，一行代码搞定
             List<Date> dates = TriggerUtils.computeFireTimes(cronTriggerImpl, null, 10);
             for (Date date : dates) {
                 list.add(DateUtil.formatDateTime(date));
             }
         } catch (ParseException e) {
             return null;
         }
         return list;
    }
}
