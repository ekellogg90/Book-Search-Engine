const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({ _id: context.user._id }).select('-__v -password');
            }
            throw new AuthenticationError('You need to be logged in!');
        }
    },

    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw AuthenticationError;
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw AuthenticationError;
            }
            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (parent, { newBook }, context) => {
            if (context.user) {
                const book = await Book.create({
                    newBook
                });

                await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: newBook} },
                    { new: true }
                );
                return book;
            }
            throw AuthenticationError;
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const book = await Book.findOneAndDelete({
                    _id: bookId
                });
                await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: bookId}},
                    { new: true }
                );
                return book;
            }
            throw AuthenticationError;
        }
    },

};

module.exports = resolvers;


// getSingleUser / createUser / login / saveBook / deleteBook