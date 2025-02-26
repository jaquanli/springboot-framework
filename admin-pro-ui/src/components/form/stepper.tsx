import React from "react";
import {FormItemProps} from "@/components/form/types";
import {Form, InputNumber} from "antd";
import formFieldInit from "@/components/form/common";

const FormStepper: React.FC<FormItemProps> = (props) => {

    const {formAction} = formFieldInit(props);

    return (
        <Form.Item
            name={props.name}
            label={props.label}
            hidden={props.hidden}
            help={props.help}
            required={props.required}
        >
            <InputNumber
                style={{
                    width:"100%"
                }}
                disabled={props.disabled}
                value={props.value}
                max={props.stepperMaxNumber}
                min={props.stepperMinNumber}
                step={props.stepperDecimalLength}
                onChange={(value) => {
                    formAction?.setFieldValue(props.name, value);
                    props.onChange && props.onChange(value, formAction);
                }}
            />
        </Form.Item>
    )
}

export default FormStepper;
