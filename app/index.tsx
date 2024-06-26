import {useRef, useState} from "react";
import { Button } from "react-native";

import {ImageSourcePropType, Platform, StyleSheet, View} from "react-native";
import {StatusBar} from "expo-status-bar";
import * as ImagePicker from 'expo-image-picker';
import {GestureHandlerRootView} from "react-native-gesture-handler";
import * as MediaLibrary from 'expo-media-library';
import {captureRef} from "react-native-view-shot";
import domToImage from 'dom-to-image';

import ImageViewer from "@/components/ImageViewer";
import ButtonView from "@/components/ButtonView";
import CircularButton from "@/components/CircularButton";
import IconButton from "@/components/IconButton";
import EmojiPickerModal from "@/components/EmojiPickerModal";
import EmojiList from "@/components/EmojiList";
import EmojiSticker from "@/components/EmojiSticker";
import NotificationModal from "@/components/NotificationModal";

export default function Index() {
    const [status, requestPermission] = MediaLibrary.usePermissions();
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [showAppOptions, setShowAppOptions] = useState<boolean>(false);
    const [modalVisible, setModalVisible] = useState<boolean>(false);
    const [pickedEmoji, setPickedEmoji] = useState<ImageSourcePropType | null>(null);
    const [notificationVisible, setNotificationVisible] = useState<boolean>(false);
    const [notificationMessage, setNotificationMessage] = useState<string>('');
    const imageRef = useRef(null);
    const [emojiSelected , setEmojiSelected] = useState(false);


    const pickImageAsync = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 1,
        });
        if (!result.canceled) {
            setSelectedImage(result.assets[0].uri);
            setShowAppOptions(true);
        } else {
            setNotificationVisible(true);
            setNotificationMessage("You cancelled the image picker");
            
        }
    };
    const onReset = () => {
        setShowAppOptions(false);
        setSelectedImage('');
        setPickedEmoji(null);
        setEmojiSelected(false);
    }
    const onAddSticker = () => {
        setModalVisible(true);
        setEmojiSelected(true);
    }
    const onSaveImageAsync = async () => {

        if(!emojiSelected){
            setNotificationVisible(true)
            setNotificationMessage('Oh! no, no, no!!! You must add an emoji before saving the image.')
        }

        else if (Platform.OS !== 'web') {
            try {
                const localUri = await captureRef(imageRef, {
                    height: 440,
                    quality: 1,
                });

                await MediaLibrary.saveToLibraryAsync(localUri);
                if (localUri) {
                    setNotificationMessage("Image Saved Successfully")
                    setNotificationVisible(true)
                }
            } catch (e) {
                setNotificationMessage("An error occurred while saving the image");
                setNotificationVisible(true);
            }
        } else {
            try {
                if (imageRef.current) {
                    const dataUrl = await domToImage.toJpeg(imageRef.current, {
                        width: 320,
                        height: 440,
                        quality: 1
                    });
                    let link = document.createElement('a');
                    link.download = 'image.jpeg';
                    link.href = dataUrl;
                    link.click();
                    setNotificationMessage("Image saved successfully");
                    setNotificationVisible(true);
                }
            } catch (e) {
                setNotificationMessage("An error occurred while saving the image");
                setNotificationVisible(true);
                 
            }


        }

    }
    const closeModal = () => {
        setModalVisible(false);
    }

    const closeNotification = () => {
        setNotificationVisible(false);
    }

    if (status === null) {
        requestPermission();
    }
    //
    return (
        <GestureHandlerRootView
            style={styles.background}
        >
            <View
                style={styles.imageContainer}
                ref={imageRef}
                collapsable={false}
            >
                <ImageViewer
                    placeHolderSource={require('@/assets/images/background-image.png')}
                    imageSource={selectedImage}
                />
                {pickedEmoji ? <EmojiSticker imageSize={40} stickerSource={pickedEmoji}/> : null}
            </View>
            {
                showAppOptions ? (
                    <View style={styles.optionsContainer}>
                        <View style={styles.optionsRow}>
                            <IconButton icon={"refresh"} onPress={onReset} text={"Reset"}/>
                            <CircularButton onPress={onAddSticker}/>
                            <IconButton icon={"save-alt"} onPress={onSaveImageAsync} text={"Save"}/>
                        </View>
                    </View>
                ) : (
                    <View style={styles.footerContainer}>
                        <ButtonView
                            theme={'primary'}
                            text={'Choose a photo'} onPress={pickImageAsync}/>
                        <ButtonView text={'Use this photo'} onPress={
                            () => {
                                setShowAppOptions(true);
                            }
                        }/>
                    </View>
                )
            }
            
            <EmojiPickerModal isVisible={modalVisible} onClose={closeModal}>
                <EmojiList onSelect={setPickedEmoji} onCLose={closeModal}/>
            </EmojiPickerModal>
            <NotificationModal isVisible={notificationVisible} onClose={closeNotification} message={notificationMessage} />
            <StatusBar style="inverted"/>
        </GestureHandlerRootView>
    );
}




const styles = StyleSheet.create({
    background: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#25292e',
    },
    text: {
        fontSize: 28,
        lineHeight: 32,
        marginTop: -6,
        color: '#fff',
    },
    footerContainer: {
        flex: 1 / 3,
        alignItems: 'center'
    },
    imageContainer: {
        flex: 1,
        paddingTop: 58
    },
    optionsContainer: {
        position: "absolute",
        bottom: 80
    },
    optionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%'
    }
});
