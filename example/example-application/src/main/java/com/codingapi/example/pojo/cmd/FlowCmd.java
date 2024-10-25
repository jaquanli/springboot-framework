package com.codingapi.example.pojo.cmd;

import com.alibaba.fastjson.JSONObject;
import com.codingapi.springboot.flow.bind.IBindData;
import com.codingapi.springboot.flow.domain.Opinion;
import com.codingapi.springboot.security.gateway.TokenContext;
import lombok.Getter;
import lombok.Setter;
import lombok.SneakyThrows;

public class FlowCmd {

    @Setter
    @Getter
    public static class StartFlow {

        private long workId;
        private String advice;
        private JSONObject formData;

        @SneakyThrows
        public IBindData getBindData() {
            String clazzName = formData.getString("clazzName");
            return (IBindData)formData.toJavaObject(Class.forName(clazzName));
        }

        public String getUserName() {
            return TokenContext.current().getUsername();
        }
    }


    @Setter
    @Getter
    public static class SubmitFlow {

        private long recordId;
        private Opinion opinion;
        private JSONObject formData;

        @SneakyThrows
        public IBindData getBindData() {
            String clazzName = formData.getString("clazzName");
            return (IBindData)formData.toJavaObject(Class.forName(clazzName));
        }

        public String getUserName() {
            return TokenContext.current().getUsername();
        }
    }

    @Setter
    @Getter
    public static class SaveFlow {

        private long recordId;
        private JSONObject formData;
        private String advice;

        @SneakyThrows
        public IBindData getBindData() {
            String clazzName = formData.getString("clazzName");
            return (IBindData)formData.toJavaObject(Class.forName(clazzName));
        }

        public String getUserName() {
            return TokenContext.current().getUsername();
        }
    }


    @Setter
    @Getter
    public static class RecallFlow {

        private long recordId;


        public String getUserName() {
            return TokenContext.current().getUsername();
        }
    }


    @Setter
    @Getter
    public static class TransferFlow {

        private long recordId;

        private long targetUserId;

        private JSONObject formData;

        private String advice;

        @SneakyThrows
        public IBindData getBindData() {
            String clazzName = formData.getString("clazzName");
            return (IBindData)formData.toJavaObject(Class.forName(clazzName));
        }

        public String getUserName() {
            return TokenContext.current().getUsername();
        }
    }


    @Setter
    @Getter
    public static class ReadFlow {

        private long recordId;

        public String getUserName() {
            return TokenContext.current().getUsername();
        }
    }


    @Setter
    @Getter
    public static class InterfereFlow {

        private long recordId;

        private Opinion opinion;
        private JSONObject formData;

        public String getUserName() {
            return TokenContext.current().getUsername();
        }

        @SneakyThrows
        public IBindData getBindData() {
            String clazzName = formData.getString("clazzName");
            return (IBindData)formData.toJavaObject(Class.forName(clazzName));
        }
    }


    @Setter
    @Getter
    public static class UrgeFlow {

        private long recordId;

        public String getUserName() {
            return TokenContext.current().getUsername();
        }
    }


    @Setter
    @Getter
    public static class PostponedFlow {
        private long recordId;

        private long timeOut;

        public String getUserName() {
            return TokenContext.current().getUsername();
        }
    }

}
