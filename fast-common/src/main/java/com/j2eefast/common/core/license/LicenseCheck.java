/**
 * Copyright (c) 2016-Now http://www.j2eefast.com All rights reserved.
 * No deletion without permission
 */
package com.j2eefast.common.core.license;

import java.io.Serializable;
import java.util.List;

/**
 * <p>自定义需要校验参数</p>
 *
 * @author: zhouzhou Emall:loveingowp@163.com
 * @date: 2020-03-17 22:43
 * @web: http://www.j2eefast.com
 * @version: 1.0.1
 */
public class LicenseCheck implements Serializable {

    private static final long               serialVersionUID                = 1L;

    /**
     * 是否认证ip
     */
    private boolean isIpCheck ;

    /**
     * 可被允许的IP地址
     */
    private List<String> ipAddress;

    /**
     * 是否认证在线人数
     */
    private boolean isOnlineCheck;

    private int onlineNum;

    /**
     * FASTSN
     */
    public String fastSn;


    public boolean isIpCheck() {
        return isIpCheck;
    }

    public void setIpCheck(boolean ipCheck) {
        isIpCheck = ipCheck;
    }

    public List<String> getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(List<String> ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getFastSn() {
        return fastSn;
    }

    public void setFastSn(String fastSn) {
        this.fastSn = fastSn;
    }

    public boolean isOnlineCheck() {
        return isOnlineCheck;
    }

    public void setOnlineCheck(boolean onlineCheck) {
        isOnlineCheck = onlineCheck;
    }

    public int getOnlineNum() {
        return onlineNum;
    }

    public void setOnlineNum(int onlineNum) {
        this.onlineNum = onlineNum;
    }
}
