import React , {Component} from 'react'
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    PixelRatio,
} from 'react-native';

var styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1/PixelRatio.get(),
        borderColor: '#666',
        backgroundColor: '#fff',
        height:60,

    },
    nameLabel: {
        flex: 1,
    },
    dragView: {
        width: 40,
        height: 40,
        backgroundColor: 'red'
    },
});

class Cell extends React.Component{
    render() {
        return (
            <View style={styles.container} {...this.props.dragHandlers}>
                <Text style={styles.nameLabel}>
                    {this.props.rowData.name}
                </Text>
                <View style={styles.dragView} />
            </View>
        );
    }
}

module.exports = Cell;
