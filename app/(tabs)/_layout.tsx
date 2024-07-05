import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

type Product = {
  id: number;
  name: string;
  price: number;
};

const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [formState, setFormState] = useState<{ name: string; price: string }>({
    name: "",
    price: "",
  });
  const [searchId, setSearchId] = useState<string>("");
  const [searchMessage, setSearchMessage] = useState<string>("");

  useEffect(() => {
    const productSubscription = supabase
      .channel("public:products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          console.log("Change received!", payload);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(productSubscription);
    };
  }, []);

  const handleAddProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .insert([{ name: formState.name, price: parseFloat(formState.price) }]);
    if (error) {
      console.error(error);
    } else if (data) {
      setProducts((prevProducts) => [...prevProducts, ...data]);
    }
    setFormState({ name: "", price: "" });
  };

  const handleSearchProduct = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", parseInt(searchId))
      .single();
    if (error) {
      console.error(error);
    } else if (data) {
      setProducts((prevProducts) => [...prevProducts, data]);
      setSearchMessage("");
    } else {
      setSearchMessage("This product with the specified ID does not exist.");
    }
    setSearchId("");
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.productItem}>
      <Text style={styles.productText}>{item.name}</Text>
      <Text style={styles.productText}>${item.price.toFixed(2)}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDeleteProduct(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Product List</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Product ID"
          value={searchId}
          onChangeText={(text) => setSearchId(text)}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchProduct}
        >
          <Text style={styles.buttonText}>Search Product</Text>
        </TouchableOpacity>
        {searchMessage ? (
          <Text style={styles.errorMessage}>{searchMessage}</Text>
        ) : null}
      </View>

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
      />

      <View style={styles.form}>
        <Text style={styles.subHeader}>Add New Product</Text>
        <TextInput
          style={styles.input}
          placeholder="Product Name"
          value={formState.name}
          onChangeText={(text) => setFormState({ ...formState, name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Product Price"
          value={formState.price}
          keyboardType="numeric"
          onChangeText={(text) => setFormState({ ...formState, price: text })}
        />
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleAddProduct}
        >
          <Text style={styles.buttonText}>Add Product</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f8f8",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  subHeader: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  searchContainer: {
    marginBottom: 20,
  },
  list: {
    marginBottom: 20,
  },
  productItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productText: {
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
  },
  button: {
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  form: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  searchButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  errorMessage: {
    color: "#f44336",
    textAlign: "center",
    marginTop: 10,
  },
});

export default ProductList;
