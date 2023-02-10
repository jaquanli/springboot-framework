package com.codingapi.springboot.framework.rest;

import com.codingapi.springboot.framework.rest.param.RestParamBuilder;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RestClientTest {

    @Test
    void get() {
        String baseUrl = "http://baike.baidu.com/";
        RestClient restClient = new RestClient(baseUrl);
        String response = restClient.get("/api/openapi/BaikeLemmaCardApi", RestParamBuilder.create()
                .add("scope","103").add("format","json")
                .add("appid","379020").add("bk_key","关键字")
        );
        assertTrue(response.contains("id"));
    }

    @Test
    void ObjToString(){
        Object val = 20;
        assertEquals(val.toString(),"20");
    }
}