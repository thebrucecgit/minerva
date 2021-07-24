import { useState } from "react";
import { useQuery } from "@apollo/client";
import { loader } from "graphql.macro";

const AUTOCOMPLETE = loader("../graphql/Autocomplete.gql");

const useUserChange = ({ setUpdate, userType }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autocomplete, setAutocomplete] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const { refetch: fetch } = useQuery(AUTOCOMPLETE, {
    skip: true,
    fetchPolicy: "no-cache",
  });

  const onAutocompleteChange = async (e) => {
    const { value } = e.target;

    setAutocomplete(value);
    setUserInfo(null);

    if (value.length > 1) {
      setLoading(true);
      const { data } = await fetch({ value: e.target.value });

      setSuggestions(data.getUsers);
      setLoading(false);
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (e) => {
    const { id } = e.currentTarget.dataset;
    const user = suggestions.find((suggestion) => suggestion._id === id);
    setUserInfo({ _id: id, name: user.name });
    setAutocomplete(user.email);
    setSuggestions([]);
  };

  const addUser = () => {
    setUpdate((st) => {
      const users = [...st[userType]];
      users.push(userInfo);
      return {
        ...st,
        [userType]: users,
      };
    });
    setAutocomplete("");
    setUserInfo(null);
  };

  const deleteUser = (e) => {
    const { id } = e.currentTarget.dataset;
    setUpdate((st) => {
      const users = st[userType].filter((user) => user._id !== id);
      return {
        ...st,
        [userType]: users,
      };
    });
  };

  const binds = {
    suggestions,
    selectSuggestion,
    autocomplete,
    onAutocompleteChange,
    addUser,
    userInfo,
  };

  return [binds, deleteUser, loading];
};

export default useUserChange;
