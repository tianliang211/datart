/*
 * Datart
 * <p>
 * Copyright 2021
 * <p>
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package datart.server.service.impl;

import datart.server.base.dto.SystemInfo;
import datart.server.service.SysService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SysServiceImpl implements SysService {

    @Value("${datart.version}")
    private String version;

    @Value("${datart.security.token.timeout-min:30}")
    private String tokenTimeout;

    @Value("${datart.user.active.send-mail:false}")
    private boolean sendMail;

    @Override
    public SystemInfo getSysInfo() {
        SystemInfo systemInfo = new SystemInfo();
        systemInfo.setVersion(version);
        systemInfo.setTokenTimeout(tokenTimeout);
        systemInfo.setMailEnable(sendMail);
        return systemInfo;
    }
}
