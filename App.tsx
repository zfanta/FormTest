/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  Button,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import superagent from 'superagent';
import Postcode from '@actbase/react-daum-postcode';
import DatePicker from 'react-native-date-picker';
import {RadioButton, Checkbox} from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import {launchImageLibrary} from 'react-native-image-picker';

const baseUrl = 'https://backup.weehan.com';

interface Field {
  name: string;
  title: string;
  imageType: boolean;
  required: boolean;
  isUse: boolean;
  member_join_form_srl?: number;
  type?:
    | 'text'
    | 'homepage'
    | 'email_address'
    | 'tel'
    | 'textarea'
    | 'radio'
    | 'select'
    | 'checkbox'
    | 'kr_zip'
    | 'date';
}
type Form = Field[];
interface ExtendedField {
  member_join_form_srl: number;
  default_value: string[];
}

async function getForm(): Promise<{form: Form; extended: ExtendedField[]}> {
  const response = await superagent.get(
    `${baseUrl}/modules/json/index.php?act=dispMemberSignUpForm`,
  );
  return {
    form: response.body.member_config.signupForm,
    extended: response.body.extend_form_list,
  };
}

interface FormProps {
  field: Field;
  extended?: ExtendedField;
}
function Form({field, extended}: FormProps) {
  const [zipVisible, setZipVisible] = useState(false);
  const [dateVisible, setDateVisible] = useState(false);
  const [radioValue, setRadioValue] = useState('');
  const [checkboxValue, setCheckboxValue] = useState<string[]>([]);
  const [selectValue, setSelectValue] = useState('');

  if (zipVisible) {
    return (
      <Modal>
        <SafeAreaView>
          <Postcode
            onError={console.error}
            style={{width: 320, height: 320}}
            jsOptions={{animation: true, hideMapBtn: true}}
            onSelected={data => {
              console.log(data);
              setZipVisible(false);
            }}
          />
        </SafeAreaView>
      </Modal>
    );
  }

  if (dateVisible) {
    return (
      <DatePicker
        modal
        mode="date"
        open={dateVisible}
        date={new Date()}
        onConfirm={date => {
          setDateVisible(false);
          console.log(date);
        }}
        onCancel={() => {
          setDateVisible(false);
        }}
      />
    );
  }

  const Field = (() => {
    if (field.imageType) {
      return (
        <Button
          title="사진 선택"
          onPress={() => {
            launchImageLibrary({mediaType: 'photo'})
              .then(console.log)
              .catch(console.error);
          }}
        />
      );
    }
    switch (field.type) {
      case 'tel':
        return (
          <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
            <TextInput keyboardType="phone-pad" />
            <Text>-</Text>
            <TextInput keyboardType="phone-pad" />
            <Text>-</Text>
            <TextInput keyboardType="phone-pad" />
          </View>
        );
      case 'kr_zip':
        return (
          <Button
            title="우편번호"
            onPress={() => {
              setZipVisible(true);
            }}
          />
        );
      case 'date':
        return (
          <Button
            title="날짜"
            onPress={() => {
              setDateVisible(true);
            }}
          />
        );
      case 'radio':
        if (extended === undefined) {
          return <Text>에러</Text>;
        }
        return (
          <RadioButton.Group
            onValueChange={newValue => setRadioValue(newValue)}
            value={radioValue}>
            <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
              {extended.default_value.map(value => (
                <RadioButton.Item
                  label={value}
                  value={value}
                  key={value}
                  status={value === radioValue ? 'checked' : 'unchecked'}
                  position="leading"
                />
              ))}
            </View>
          </RadioButton.Group>
        );
      case 'checkbox':
        if (extended === undefined) {
          return <Text>에러</Text>;
        }
        return (
          <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
            {extended.default_value.map(value => (
              <Checkbox.Item
                label={value}
                key={value}
                status={checkboxValue.includes(value) ? 'checked' : 'unchecked'}
                position="leading"
                onPress={() => {
                  if (checkboxValue.includes(value)) {
                    setCheckboxValue(checkboxValue.filter(v => v !== value));
                  } else {
                    setCheckboxValue([...checkboxValue, value]);
                  }
                }}
              />
            ))}
          </View>
        );
      case 'select':
        if (extended === undefined) {
          return <Text>에러</Text>;
        }
        return (
          <RNPickerSelect
            value={selectValue}
            onValueChange={setSelectValue}
            items={extended.default_value.map(value => ({
              label: value,
              value: value,
            }))}
          />
        );
      case 'textarea':
        return <TextInput multiline />;
      default:
        return <TextInput />;
    }
  })();
  return (
    <>
      <Text>{field.title}</Text>
      {Field}
    </>
  );
}

const App = () => {
  const [form, setForm] = useState<Form>([]);
  const [extended, setExtended] = useState<ExtendedField[]>([]);

  useEffect(() => {
    getForm().then(({form, extended}) => {
      setForm(form);
      setExtended(extended);
    });
  }, []);
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View>
          {form
            .filter(({isUse}) => isUse)
            .map(field => (
              <Form
                key={field.name}
                field={field}
                extended={
                  field.member_join_form_srl === undefined
                    ? undefined
                    : extended[field.member_join_form_srl]
                }
              />
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
