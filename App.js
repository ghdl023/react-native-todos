import {StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView, Alert, TouchableHighlight} from 'react-native';
import {useEffect, useRef, useState} from "react";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import asyncStorage from "@react-native-async-storage/async-storage/src/AsyncStorage";

const STORAGE_KEY_TODOS = '@todos';
const STORAGE_KEY_WORKING = '@working';

export default function App() {
  const [working ,setWorking] = useState(true);
  const [text, onChangeText] = useState("");
  const inputRef = useRef();
  const [todos, setTodos] = useState({});

  const loadTodos = async () => {
    try {
      const result = await asyncStorage.getItem(STORAGE_KEY_TODOS);
      if(result) {
        setTodos(JSON.parse(result));
      }

    } catch(e){
    }
  }

  const loadWorking = async () => {
    try {
      const _working = await asyncStorage.getItem(STORAGE_KEY_WORKING);
      if(_working) {
        setWorking(JSON.parse(_working));
      }

    } catch(e){
    }
  }

  useEffect(()=> {
    loadTodos();
    loadWorking();
  }, []);

  const addTodo = async () => {
    console.log(text);
    const newTodos = {
      ...todos,
      [Date.now()] : { text, working},
    };
    setTodos(newTodos);
    onChangeText("");
    inputRef.current.clear();

    try {
      await AsyncStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(newTodos));
    } catch(e){
    }
  }

  const deleteTodo = async (key) => {
    Alert.alert(
        '정말 삭제할까요?',
        `'${todos[key].text}'을 삭제합니다.`,
        [
          {
            text: '취소',
            style: 'cancel',
          },
          {
            text: '삭제',
            onPress: async () => {
              const newTodos = {...todos};
              delete newTodos[key];
              setTodos(newTodos);

              try {
                await AsyncStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(newTodos));
              } catch(e){
              }
            },
            style: 'ok',
          },
        ],
    );
  }

  const editTodo = (key) => {
    const newTodos = {...todos};
    newTodos[key].isEdit = true;
    newTodos[key].editText = newTodos[key].text;
    setTodos(newTodos);
  }

  const onChangeWorking = async (working) => {
    setWorking(working);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_WORKING, JSON.stringify(working));
    } catch(e){
    }
  }


  const onChangeTodoItemText = (key, text) => {
    const newTodos = {...todos};
    newTodos[key].editText = text;
    setTodos(newTodos);
  }


  const updateTodo = async (key) => {
    const newTodos = {...todos};
    newTodos[key].text = newTodos[key].editText;
    delete newTodos[key].editText;
    newTodos[key].isEdit = false;
    setTodos(newTodos);

    try {
      await AsyncStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(newTodos));
    } catch(e){
    }
  }

  const revertTodo = (key) => {
    const newTodos = {...todos};
    delete newTodos[key].editText;
    newTodos[key].isEdit = false;
    setTodos(newTodos);
  }

  const completeTodo = async (key) => {
    const newTodos = {...todos};
    newTodos[key].completed = !newTodos[key].completed;
    setTodos(newTodos);

    try {
      await AsyncStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(newTodos));
    } catch(e){
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerButton}>
          <TouchableOpacity onPress={()=> onChangeWorking(true)}>
            <Text style={{...styles.headerText, color: working ? '#FFFFFF': 'grey'}}>Work</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerButton}>
          <TouchableOpacity onPress={()=> onChangeWorking(false)}>
            <Text style={{...styles.headerText, color: !working ? '#FFFFFF': 'grey'}}>Bucket</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <TextInput ref={inputRef} style={styles.input} onChangeText={onChangeText} onSubmitEditing={addTodo} placeholder={ working ? '할 일을 적어주세요.' : '살면서 꼭 하고 싶은 버킷을 적어주세요.'}/>
      </View>
      <View style={styles.body}>
        <ScrollView
            showsVerticalScrollIndicator={false}
        >
          { Object.keys(todos).sort(function(a,b){
            return b- a;
          }).map((key) =>
              todos[key].working === working ?
                  <TouchableHighlight key={key} onLongPress={()=> completeTodo(key)}>
                    <View style={styles.todoItem}>
                      { todos[key].isEdit ?
                          <TextInput style={styles.todoItemText} onChangeText={(text)=> onChangeTodoItemText(key, text)} onSubmitEditing={()=> updateTodo(key)} onEndEditing={()=> {todos[key].isEdit = false}} value={todos[key].editText} placeholder={ working ? '할 일을 적어주세요.' : '살면서 꼭 하고 싶은 버킷을 적어주세요.'} autoFocus={true}/> :
                          <Text style={{...styles.todoItemText, textDecorationLine: todos[key].completed ? 'line-through' : ''}}>{ todos[key].text }</Text>
                      }
                      { todos[key].isEdit ?
                          <View style={{flexDirection: 'row',}}>
                            <TouchableOpacity style={styles.icon} onPress={() => updateTodo(key)}>
                              <Ionicons name="checkmark" size={30} color="#50FA7B" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.icon} onPress={() => revertTodo(key)}>
                              <Ionicons name="close" size={30} color="red" />
                            </TouchableOpacity>
                          </View>
                          : <View style={{flexDirection: 'row',}}>
                            <TouchableOpacity style={styles.icon} onPress={() => editTodo(key)}>
                              <Ionicons name="pencil" size={30} color="#515460" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.icon} onPress={() => deleteTodo(key)}>
                              <Ionicons name="trash" size={30} color="#515460" />
                            </TouchableOpacity>
                          </View>
                      }
                    </View>
                  </TouchableHighlight>: null
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
    paddingVertical: 50,
    paddingHorizontal: 50,
  },
  header: {
    flex: 1,
    flexDirection: 'row',
  },
  headerButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    fontSize: 60,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 25,
    fontSize: 20,
  },
  body: {
    flex: 3,
    marginTop: 20,
  },
  todoItem: {
    backgroundColor: '#23262F',
    paddingVertical: 50,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  todoItemText: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  icon: {
    marginRight: 10,
  },
});
