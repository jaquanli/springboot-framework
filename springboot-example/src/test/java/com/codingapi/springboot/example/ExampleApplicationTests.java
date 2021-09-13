package com.codingapi.springboot.example;

import com.codingapi.springboot.example.domain.Demo;
import com.codingapi.springboot.example.domain.service.DemoSwapService;
import com.codingapi.springboot.example.repository.DemoRepository;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.util.Assert;

@SpringBootTest
@Slf4j
class ExampleApplicationTests {

	@Autowired
	private DemoRepository demoRepository;

	@Autowired
	private DemoSwapService demoSwapService;

	@Test
	void save() {
		Demo demo = new Demo("xiaoming");
		demoRepository.save(demo);
		Assert.isTrue(demo.getId()>0,"demoRepository save error.");

	}

	@Test
	void changeJdbcTest(){
		demoRepository.findById(1).ifPresent(demo -> {
			log.info("demo:{}",demo);
			Assert.isTrue(demo.getUserId()==1,"update user_id error.");
		});

	}

	@Test
	void swap(){
		Demo demo1 = new Demo("demo1");
		Demo demo2 = new Demo("demo2");
		demoSwapService.swap(demo1,demo2);
		Assert.isTrue(demo1.getName().equals("demo2"),"swap service error.");
		Assert.isTrue(demo2.getName().equals("demo1"),"swap service error.");
	}



}
