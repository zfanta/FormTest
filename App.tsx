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

const baseUrl = 'http://backup.weehan.com';
const referer = 'https://backup.weehan.com';

interface Field {
  name: string;
  title: string;
  description: string;
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

interface MemberInfo {
  [key: string]: any;
}

async function getForm(): Promise<{
  form: Form;
  extended: ExtendedField[];
  memberInfo: MemberInfo;
}> {
  await superagent.get(
    `${baseUrl}/modules/json/index.php?act=dispMemberLogout`,
  );
  await superagent
    .post(`${baseUrl}/modules/json/index.php?act=procMemberLogin`)
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .set('Referer', referer)
    .send({
      user_id: 'formtest',
      password: '1q2w3e4r',
    });

  await superagent.get(
    `${baseUrl}/modules/json/index.php?act=dispMemberModifyInfo`,
  );

  await superagent
    .post(`${baseUrl}/modules/json/index.php`)
    .set('Content-Type', 'application/x-www-form-urlencoded')
    .set('Referer', referer)
    .send({
      act: 'procMemberModifyInfoBefore',
      password: '1q2w3e4r',
    });

  const response = await superagent.get(
    `${baseUrl}/modules/json/index.php?act=dispMemberModifyInfo`,
  );
  console.log(Object.keys(response.body));
  return {
    form: response.body.member_config.signupForm,
    extended: response.body.extend_form_list,
    memberInfo: response.body.member_info,
  };
}

interface FormProps {
  field: Field;
  extended?: ExtendedField;
  state: Record<string, string | string[]>;
  setState: React.Dispatch<
    React.SetStateAction<Record<string, string | string[]>>
  >;
}

function Zip({field, state, setState}: FormProps) {
  const [zipVisible, setZipVisible] = useState(false);

  if (zipVisible) {
    return (
      <Modal>
        <SafeAreaView>
          <Postcode
            onError={console.error}
            style={{width: 320, height: 320}}
            jsOptions={{animation: true, hideMapBtn: true}}
            onSelected={response => {
              setZipVisible(false);
              let fullAddr = '';
              let extraAddr = '';
              let postcode: number;

              /* ????????? ????????? ???????????? ?????? */
              if (response.userSelectedType === 'R') {
                fullAddr = response.roadAddress;
                /* ??????????????? ?????? ?????? */
                if (response.bname !== '') {
                  extraAddr += response.bname;
                }
                /* ???????????? ?????? ?????? */
                if (response.buildingName !== '') {
                  extraAddr +=
                    extraAddr !== ''
                      ? ', ' + response.buildingName
                      : response.buildingName;
                }
                if (extraAddr) {
                  extraAddr = '(' + extraAddr + ')';
                }
              } else {
                /* ?????? ????????? ???????????? ?????? */
                fullAddr = response.jibunAddress;
              }

              /* ???????????? ?????? */
              postcode = response.zonecode;

              /* ????????? ?????? ?????? */
              let roadAddr =
                response.userSelectedType === 'R'
                  ? fullAddr
                  : response.roadAddress;

              /* ?????? ?????? ?????? */
              var jibunAddr =
                response.userSelectedType === 'R'
                  ? response.jibunAddress
                  : fullAddr;
              jibunAddr = jibunAddr ? '(' + jibunAddr + ')' : jibunAddr;

              /* ?????? ?????? ?????? */
              setState({
                ...state,
                [field.name]: [
                  `${postcode}`,
                  roadAddr,
                  jibunAddr,
                  '',
                  extraAddr,
                ],
              });
            }}
          />
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <>
      <Button
        title="????????????"
        onPress={() => {
          setZipVisible(true);
        }}
      />
      <Text>{state[field.name]?.[0]}</Text>
      <Text>{state[field.name]?.[1]}</Text>
      <Text>{state[field.name]?.[2]}</Text>
      <Text>{state[field.name]?.[4]}</Text>
      <TextInput
        placeholder="?????? ?????? ??????"
        onEndEditing={({nativeEvent: {text}}) => {
          const address = Array.from(state[field.name] || []);
          address[3] = text;
          setState({
            ...state,
            [field.name]: address,
          });
        }}
      />
    </>
  );
}

function DateInput({field, state, setState}: FormProps) {
  const [dateVisible, setDateVisible] = useState(false);

  if (dateVisible) {
    return (
      <DatePicker
        modal
        mode="date"
        open={dateVisible}
        date={new Date()}
        onConfirm={date => {
          setDateVisible(false);
          const year = date.getFullYear();
          const month = ('0' + (1 + date.getMonth())).slice(-2);
          const day = ('0' + date.getDate()).slice(-2);

          const result = `${year}${month}${day}`;
          setState({
            ...state,
            [field.name]: result,
          });
        }}
        onCancel={() => {
          setDateVisible(false);
        }}
      />
    );
  }

  return (
    <Button
      title="??????"
      onPress={() => {
        setDateVisible(true);
      }}
    />
  );
}

function Image({field, state, setState}: FormProps) {
  return (
    <Button
      title="?????? ??????"
      onPress={() => {
        launchImageLibrary({mediaType: 'photo'})
          .then(({assets}) => {
            if (assets === undefined) {
              throw new Error('No assets');
            }
            if (assets[0].uri === undefined) {
              throw new Error('No uri');
            }
            return assets[0].uri;
          })
          .then(uri => {
            setState({
              ...state,
              [field.name]: uri,
            });
          })
          .catch(console.error);
      }}
    />
  );
}

function FindAccount({field, state, setState}: FormProps) {
  const [findAccountQuestion, setFindAccountQuestion] = useState('0');

  return (
    <>
      <RNPickerSelect
        value={findAccountQuestion}
        onValueChange={value => {
          setFindAccountQuestion(value);
          setState({
            ...state,
            [field.name]: value,
          });
        }}
        items={[
          {label: '?????? ????????? ??????????', value: '1'},
          {label: '?????? ?????? 1???????', value: '2'},
          {label: '?????? ?????? ????????????????', value: '3'},
          {label: '?????? ?????? ??????????', value: '4'},
          {label: '?????? ?????????????', value: '5'},
          {label: '????????? ??????????', value: '6'},
          {label: '????????? ??????????', value: '7'},
          {label: '?????? ???????????? ??????????', value: '8'},
          {label: '?????? ???????????? ??????????', value: '9'},
        ]}
      />
      <TextInput
        placeholder="??????"
        onEndEditing={({nativeEvent: {text}}) => {
          setState({
            ...state,
            find_account_answer: text,
          });
        }}
      />
    </>
  );
}

function Tel({field, state, setState}: FormProps) {
  return (
    <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
      <TextInput
        keyboardType="phone-pad"
        onEndEditing={({nativeEvent: {text}}) => {
          const phone = Array.from(state[field.name] || []);
          phone[0] = text;
          setState({
            ...state,
            [field.name]: phone,
          });
        }}
        value={state[field.name]?.[0]}
      />
      <Text>-</Text>
      <TextInput
        keyboardType="phone-pad"
        onEndEditing={({nativeEvent: {text}}) => {
          const phone = Array.from(state[field.name] || []);
          phone[1] = text;
          setState({
            ...state,
            [field.name]: phone,
          });
        }}
        value={state[field.name]?.[1]}
      />
      <Text>-</Text>
      <TextInput
        keyboardType="phone-pad"
        onEndEditing={({nativeEvent: {text}}) => {
          const phone = Array.from(state[field.name] || []);
          phone[2] = text;
          setState({
            ...state,
            [field.name]: phone,
          });
        }}
        value={state[field.name]?.[2]}
      />
    </View>
  );
}

function Radio({field, extended, state, setState}: FormProps) {
  const [radioValue, setRadioValue] = useState('');

  if (extended === undefined) {
    return <Text>??????</Text>;
  }
  return (
    <RadioButton.Group
      onValueChange={newValue => {
        setRadioValue(newValue);
        setState({
          ...state,
          [field.name]: newValue,
        });
      }}
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
}

function CheckBox({field, extended, state, setState}: FormProps) {
  const [checkboxValue, setCheckboxValue] = useState<string[]>([]);

  if (extended === undefined) {
    return <Text>??????</Text>;
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
              setState({
                ...state,
                [field.name]: checkboxValue.filter(v => v !== value),
              });
            } else {
              setCheckboxValue([...checkboxValue, value]);
              setState({
                ...state,
                [field.name]: [...checkboxValue, value],
              });
            }
          }}
        />
      ))}
    </View>
  );
}

function Select({field, extended, state, setState}: FormProps) {
  const [selectValue, setSelectValue] = useState('');

  if (extended === undefined) {
    return <Text>??????</Text>;
  }
  return (
    <RNPickerSelect
      value={selectValue}
      onValueChange={value => {
        setSelectValue(value);
        setState({
          ...state,
          [field.name]: value,
        });
      }}
      items={extended.default_value.map(value => ({
        label: value,
        value: value,
      }))}
    />
  );
}

function Field({field, extended, state, setState}: FormProps) {
  if (field.name === 'password') {
    return null;
  }

  const Input = (() => {
    if (field.imageType) {
      return <Image field={field} state={state} setState={setState} />;
    }
    if (field.name === 'find_account_question') {
      return <FindAccount field={field} state={state} setState={setState} />;
    }
    switch (field.type) {
      case 'tel':
        return <Tel field={field} state={state} setState={setState} />;
      case 'kr_zip':
        return <Zip field={field} state={state} setState={setState} />;
      case 'date':
        return <DateInput field={field} state={state} setState={setState} />;
      case 'radio':
        return (
          <Radio
            field={field}
            state={state}
            setState={setState}
            extended={extended}
          />
        );
      case 'checkbox':
        return (
          <CheckBox
            field={field}
            state={state}
            setState={setState}
            extended={extended}
          />
        );
      case 'select':
        return (
          <Select
            field={field}
            state={state}
            setState={setState}
            extended={extended}
          />
        );
      case 'textarea':
        return (
          <TextInput
            multiline
            onEndEditing={({nativeEvent: {text}}) =>
              setState({...state, [field.name]: text})
            }
          />
        );
      default:
        return (
          <TextInput
            onEndEditing={({nativeEvent: {text}}) => {
              setState({...state, [field.name]: text});
            }}
            value={state[field.name] as string}
          />
        );
    }
  })();
  return (
    <>
      <Text>{field.title}</Text>
      {Input}
      {field.description !== undefined ? (
        <Text>{field.description}</Text>
      ) : null}
    </>
  );
}

async function sendRequest(state: Record<string, string | string[]>) {
  const body = new FormData();

  for (const [key, value] of Object.entries(state)) {
    if (key === 'profile_image') {
      body.append('profile_image', {
        uri: state.profile_image,
        name: 'image.jpg',
        type: 'image/jpeg',
      });
      body.append('__profile_image_exist', 'true');
    } else if (key === 'image_mark') {
      body.append('image_mark', {
        uri: state.image_mark,
        name: 'image.jpg',
        type: 'image/jpeg',
      });
      body.append('__image_mark_exist', 'true');
    } else if (Array.isArray(value)) {
      value.forEach(v => body.append(`${key}[]`, v));
    } else {
      body.append(key, value);
    }
  }
  fetch(`${baseUrl}/modules/json/index.php?act=procMemberModifyInfo`, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'multipart/form-data',
      Referer: referer,
    },
  }).catch(console.error);
}

function Agreement({
  state,
  setState,
}: Pick<FormProps, 'state' | 'setState'>): JSX.Element {
  const [radioValue, setRadioValue] = useState('');

  return (
    <View>
      <Text>?????? ??????</Text>
      <RadioButton.Group
        onValueChange={newValue => {
          setRadioValue(newValue);
          setState({
            ...state,
            accept_agreement: newValue,
          });
        }}
        value={radioValue}>
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          <RadioButton.Item
            label="???"
            value="Y"
            status={radioValue === 'Y' ? 'checked' : 'unchecked'}
            position="leading"
          />
          <RadioButton.Item
            label="?????????"
            value="N"
            status={radioValue === 'N' ? 'checked' : 'unchecked'}
            position="leading"
          />
        </View>
      </RadioButton.Group>
    </View>
  );
}

function Mailing({
  state,
  setState,
}: Pick<FormProps, 'state' | 'setState'>): JSX.Element {
  const [radioValue, setRadioValue] = useState(
    (state?.allow_mailing as string | undefined) ?? '',
  );
  useEffect(() => {
    setRadioValue(state?.allow_mailing as string);
  }, [state]);

  return (
    <View>
      <Text>?????? ?????? ??????</Text>
      <RadioButton.Group
        onValueChange={newValue => {
          setRadioValue(newValue);
          setState({
            ...state,
            allow_mailing: newValue,
          });
        }}
        value={radioValue}>
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          <RadioButton.Item
            label="???"
            value="Y"
            status={radioValue === 'Y' ? 'checked' : 'unchecked'}
            position="leading"
          />
          <RadioButton.Item
            label="?????????"
            value="N"
            status={radioValue === 'N' ? 'checked' : 'unchecked'}
            position="leading"
          />
        </View>
      </RadioButton.Group>
    </View>
  );
}

function Message({
  state,
  setState,
}: Pick<FormProps, 'state' | 'setState'>): JSX.Element {
  const [radioValue, setRadioValue] = useState<string>(
    (state?.allow_message as string) ?? '',
  );
  useEffect(() => {
    setRadioValue(state?.allow_message as string);
  }, [state]);

  return (
    <View>
      <Text>????????? ??????</Text>
      <RadioButton.Group
        onValueChange={newValue => {
          setRadioValue(newValue);
          setState({
            ...state,
            allow_message: newValue,
          });
        }}
        value={radioValue}>
        <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
          <RadioButton.Item
            label="?????? ??????"
            value="Y"
            status={radioValue === 'Y' ? 'checked' : 'unchecked'}
            position="leading"
          />
          <RadioButton.Item
            label="????????? ??????"
            value="F"
            status={radioValue === 'F' ? 'checked' : 'unchecked'}
            position="leading"
          />
          <RadioButton.Item
            label="?????? ??????"
            value="N"
            status={radioValue === 'N' ? 'checked' : 'unchecked'}
            position="leading"
          />
        </View>
      </RadioButton.Group>
    </View>
  );
}

const App = () => {
  const [form, setForm] = useState<Form>([]);
  const [extended, setExtended] = useState<ExtendedField[]>([]);
  const [state, setState] = useState<Record<string, string | string[]>>({});

  useEffect(() => {
    getForm().then(({form, extended, memberInfo}) => {
      setForm(form);
      setExtended(extended);
      setState({
        user_id: memberInfo.user_id,
        email_address: memberInfo.email_address,
        user_name: memberInfo.user_name,
        nick_name: memberInfo.nick_name,
        phone: memberInfo.phone,
        allow_message: memberInfo.allow_message,
        allow_mailing: memberInfo.allow_mailing,
      });
    });
  }, []);

  useEffect(() => {}, [state]);

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
              <Field
                key={field.name}
                field={field}
                state={state}
                setState={setState}
                extended={
                  field.member_join_form_srl === undefined
                    ? undefined
                    : extended[field.member_join_form_srl]
                }
              />
            ))}
          <Message state={state} setState={setState} />
          <Mailing state={state} setState={setState} />
          <Button title={'??????'} onPress={() => sendRequest(state)} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
