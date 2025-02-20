import {NamePath} from "antd-mobile/es/components/form";
import type {Rule} from "rc-field-form/lib/interface";
import {FormValidateContent} from "@/components/form/validate";
import {FormAction} from "@/components/form";

// Form表单选项类型
export interface FormOption {
    label: string;
    value: string;
    disable?: boolean;
    children?: FormOption[];
}

// Form表单类型
type FormFieldType =
    "input" | "cascader" | "select" | "password" | "date" |
    "radio" | "textarea" | "checkbox" | "uploader" | "switch" |
    "stepper" | "slider" | "rate" | "selector" | "captcha";

// FormField
export interface FormField {
    // 表单字段类型
    type: FormFieldType;
    // 表单字段属性
    props: FormItemProps;
}

// Form表单字段属性
export interface FormItemProps {
    // 是否隐藏字段
    hidden?: boolean;
    // 是否禁用
    disabled?: boolean;
    // 是否必填,当为true时会自动给rules添加required校验
    required?: boolean;
    // 静态规则校验，对应validateFunction的动态校验
    rules?: Rule[];
    // 表单字段名
    name?: NamePath;
    // 表单字段标签
    label?: string;
    // 帮助提示信息
    help?: string;
    // 表单值
    value?: any;
    // 输入提示
    placeholder?: string;
    // 变更事件
    onChange?: (value: any, form?: FormAction) => void;
    // 静态选项，对应loadOptions的动态选项，仅限于select、radio等组件有效
    options?: FormOption[],
    // 动态加载选项,仅限于select、radio等组件有效
    loadOptions?: (form?: FormAction) => Promise<FormOption[]>,
    // 动态校验函数,尽在fields模式下生效
    validateFunction?: (content: FormValidateContent) => Promise<string[]>,

    /** 以下为表单字段的拓展熟悉，非公共属性 **/
    // 单选框方向
    radioDirection?: "vertical" | "horizontal",
    // 多选框方向
    checkboxDirection?: "vertical" | "horizontal",
    // TextArea输入行数
    textAreaRows?: number,
    // TextArea输入框最大值
    textAreaMaxLength?: number,
    // select组件是否支持多选
    selectMultiple?: boolean,
    // 文件上传接受的文件类型，默认为 image/*
    uploaderAccept?: string,
    // 文件上传最大数量
    uploaderMaxCount?: number,
    // input输入框最大值
    inputMaxLength?: number,
    // input输入框类型，默认为text
    inputType?: "text" | "number",
    // date组件的日期格式，默认YYYY-MM-DD
    dateFormat?: string,
    // date组件的精度，默认为day
    datePrecision?: "year" | "month" | "day" | "hour" | "minute" | "second" | "week" | "week-day" | "quarter",
    // switch选择文本
    switchCheckText?: string,
    // switch未选择文本
    switchUnCheckText?: string,
    // stepper组件的最大值
    stepperMaxNumber?: number,
    // stepper组件的最小值
    stepperMinNumber?: number,
    // stepper组件的小数位
    stepperDecimalLength?: number,
    // slider组件的最大值
    sliderMaxNumber?: number,
    // slider组件的最小值
    sliderMinNumber?: number,
    // slider组件的拖动步距
    sliderStep?: number,
    // slider组件实现展示刻度
    sliderTicks?: boolean,
    // slider组件悬浮提示
    sliderPopover?: boolean,
    // slider组件是否双向滑动
    sliderRange?: boolean,
    // slider组件的刻度尺
    sliderMarks?: any,
    // rate的star总数
    rateCount?: number,
    // rate允许半选
    rateAllowHalf?: boolean,
    // selector组件是否多选
    selectorMultiple?: boolean,
    // selector组件每行展示数量
    selectorColumn?: number,
    // Captcha组件切换验证码事件
    onCaptchaChange?: (value: string) => void;
}


